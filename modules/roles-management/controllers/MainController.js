const { Controller } = require('@farahub/framework/foundation');
const { Injection, Lang, Validator, Auth, Workspace, Event, Doc } = require('@farahub/framework/facades');
const CreateOrUpdateRoleValidator = require('../validators/CreateOrUpdateRoleValidator');
const RoleDeleteValidator = require('../validators/RoleDeleteValidator');


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
    basePath = '/roles';

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
            handler: 'createOrUpdate'
        },
        {
            type: 'api',
            method: 'delete',
            path: '/:roleId',
            handler: 'delete'
        },
        //
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

                    const Role = connection.model('Role');
                    const Permission = this.app.connection.model('Permission');

                    const args = req.query;

                    let search = {
                        //
                    }

                    if (args && args.query && args.query !== '') {
                        search = {
                            ...search,
                            name: { $regex: args.query + '.*' }
                        }
                    }

                    const sort = args && args.sort ? args.sort : "-createdAt";

                    const populationInjections = await req.inject('populate');

                    const query = Role.find(search)
                        .select('-__v')
                        .populate([
                            { path: 'access.permission', model: Permission, select: '-__v' },
                            ...(populationInjections || [])
                        ]);

                    query.sort(sort);

                    const total = await Role.find(search).count();

                    if (args && args.page > -1) {
                        const perPage = args.perPage || 25;
                        query.skip(args.page * perPage)
                            .limit(perPage)
                    }

                    let data = await query.lean({ virtuals: true });

                    data = Lang.translate(data);

                    return res.json({ ok: true, data, total })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Create or upadte an existing role
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
            Validator.validate(new CreateOrUpdateRoleValidator(this.app)),
            Event.register(this.module),
            async function (req, res, next) {
                try {

                    const data = req.body;

                    const { inject, wsConnection: connection } = req;

                    const Role = connection.model('Role');
                    const Permission = this.app.connection.model('Permission');

                    const role = await Role.createOrUpdate(data, data.id, { inject, connection, Permission });

                    return res.json({ ok: true, role });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Delete an existing role from db
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    delete() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.delete'),
            Validator.validate(new RoleDeleteValidator()),
            Event.register(this.module),
            async function (req, res, next) {
                try {
                    const { roleId } = req.params;
                    const { wsConnection: connection, inject } = req;

                    const Role = connection.model('Role');

                    // get role document
                    const role = await Doc.resolve(roleId, Role);

                    // inject delete pre hook
                    await inject('preDelete', { role });

                    // remove role from all people
                    const Person = connection.model('Person');
                    await Person.updateMany(
                        { roles: role.id },
                        {
                            $pull: {
                                roles: { _id: role.id }
                            }
                        }
                    );

                    // delete the role
                    await Role.deleteOne({ _id: role.id });

                    // inject delete post hook
                    await inject('postDelete');

                    // dispatch event
                    // req.event(new RoleDeleted(role, req.wsConnection, req.user));

                    // return response
                    return res.json({ ok: true })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    //
}

module.exports = MainController;