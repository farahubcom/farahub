const { Controller } = require("@farahub/framework/foundation");
const { Doc, Num, Lang, Validator, Injection, Event, Auth, Workspace, Resource } = require("@farahub/framework/facades");
const CreateOrUpdateCustomerValidator = require('../validators/CreateOrUpdateCustomerValidator');
const CustomerDetailsValidator = require('../validators/CustomerDetailsValidator');
const CustomerDeleteValidator = require('../validators/CustomerDeleteValidator');
const flatten = require('lodash/flatten');
const CustomerListingResource = require("../resources/CustomerListingResource");
const { get } = require("lodash");


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
    basePath = '/customers';

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
    ]

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
                    const Role = connection.model('Role');

                    let roleCustomer = await Role.findOne({ identifier: 'customer' });

                    const args = req.query;

                    let search = {
                        roles: roleCustomer?._id,
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
            Validator.validate(new CreateOrUpdateCustomerValidator()),
            Event.register(this.module),
            async function (req, res, next) {
                try {
                    const data = req.body;

                    const { inject, wsConnection: connection, workspace, user } = req;

                    // resolve customer role
                    const Person = connection.model('Person');
                    const Role = connection.model('Role');

                    let roleCustomer = await Role.findOne({ identifier: 'customer' });

                    if (!roleCustomer) {
                        roleCustomer = await Role.createOrUpdate({
                            identifier: "customer",
                            name: "مشتری",
                            access: []
                        }, null, {
                            connection,
                            inject: Injection.register(this.app.module('Roles'), 'main.createOrUpdate', { withRequest: false })
                        })
                    }

                    if (!get(data, 'roles', []).includes(roleCustomer.id)) {
                        data.roles = [...get(data, 'roles', []), roleCustomer];
                    }

                    const person = await Person.createOrUpdate(data, data.id, {
                        connection,
                        inject: Injection.register(this.app.module('People'), 'main.createOrUpdate', { withRequest: false })
                    });

                    // create related user
                    if (person.wasNew && data.phone) {
                        const User = this.app.connection.model('User');

                        let user = await User.findOne({ phone: data.phone });
                        if (!user) {
                            user = await User.createNew(data, {
                                inject: Injection.register(this.app.module('Authentication'), 'main.createNew', false)
                            });
                        }

                        // person.user = user.id;
                        // await person.save();

                        const hasMember = await req.workspace.hasMember(user);
                        if (!hasMember) {
                            await req.workspace.addMember(user);

                            await req.workspace.setAsUserCurrentWorkspace(user);
                        }
                    }

                    res.json({ ok: true, person });

                    // dispatch event
                    // req.event(new PersonCreatedOrUpdated(person, req.wsConnection, req.user));

                    // // notify users
                    // const notifiables = await req.workspace.memberships({ user: { $ne: req.user.id } })
                    //     .select('user')
                    //     .populate('user');

                    // // send notification
                    // notifiables.map(m => req.notify(new PersonCreated(person)).to(m.user));


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