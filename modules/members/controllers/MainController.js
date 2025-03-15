const { Controller } = require('@farahub/framework/foundation');
const { Num, Validator, Injection, Event, Auth, Workspace, Resource } = require("@farahub/framework/facades");
const CreateOrUpdateMemberValidator = require('../validators/CreateOrUpdateMemberValidator');
const CustomerListingResource = require("../resources/MemberListingResource");
const get = require("lodash/get");


class MainController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Main';

    /**
     * The controller base path
     * 
     * @var string
     */
    basePath = '/members';

    /**
     * The controller routes
     * 
     * @var array
     */
    routes = [
        {
            type: 'api',
            method: 'get',
            path: '/',
            handler: 'list',
        },
        {
            type: 'api',
            method: 'post',
            path: '/',
            handler: 'createOrUpdate',
        },
    ];

    /**
     * List of people match params
     * 
     * @return void
     */
    list() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.list'),
            async (req, res, next) => {
                try {
                    const { wsConnection: connection } = req;

                    const Person = connection.model('Person');

                    const args = req.query;

                    let search = {
                        //
                    }

                    if (args && args.query && args.query !== '') {
                        search = {
                            ...search,
                            ...(
                                Num.isNumeric(args.query) ?
                                    { code: Number(args.query) } :
                                    {
                                        $or: [
                                            { firstName: { $regex: args.query + '.*' } },
                                            { lastName: { $regex: args.query + '.*' } }
                                        ]
                                    }
                            )
                        }
                    }

                    const sort = args && args.sort ? args.sort : "-createdAt";

                    const populationInjections = await req.inject('populate');

                    const query = Person.find(search)
                        .select('-__v')
                        .populate([
                            ...(populationInjections || [])
                        ]);

                    query.sort(sort);

                    const total = await Person.find(search).count();

                    if (args && args.page > -1) {
                        const perPage = args.perPage || 25;
                        query.skip(args.page * perPage)
                            .limit(perPage)
                    }

                    let data = await query.lean({ virtuals: true });

                    data = Resource.make(CustomerListingResource, data);

                    return res.json({ ok: true, data, total })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Create or upadte an existing person
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    createOrUpdate() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.createOrUpdate'),
            Validator.validate(new CreateOrUpdateMemberValidator()),
            Event.register(this.module),
            async function (req, res, next) {
                try {
                    const data = req.body;

                    const { inject, wsConnection: connection, workspace, user } = req;

                    // resolve customer role
                    const Person = connection.model('Person');

                    if (!get(data, 'roles', []).includes(roleCustomer.id)) {
                        data.roles = [...get(data, 'roles', []), roleCustomer];
                    }

                    const person = await Person.createOrUpdate(data, data.id, {
                        connection,
                        inject: Injection.register(this.app.module('People'), 'main.createOrUpdate', { withRequest: false })
                    });

                    // create related user
                    if (data.phone) {
                        const User = this.app.connection.model('User');

                        let user = await User.findOne({ phone: data.phone });
                        if (!user) {
                            user = await User.createNew(data, {
                                inject: Injection.register(this.app.module('Authentication'), 'main.createNew', false)
                            });
                        }

                        const hasMember = await req.workspace.hasMember(user);
                        if (!hasMember) {
                            await req.workspace.addMember(user);

                            await req.workspace.setAsUserCurrentWorkspace(user);
                        }
                    }

                    // return response
                    res.json({ ok: true, person });

                    // inject post response hooks
                    await inject('postResponse', { data, workspace, connection, inject, person, user, });

                    return;
                } catch (error) {
                    next(error);
                }
            }
        ]
    }
}

module.exports = MainController;