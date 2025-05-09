const { Controller } = require('@farahub/framework/foundation');
const { Auth, Injection, Validator, Lang, Doc, Resource } = require('@farahub/framework/facades');
const CreateWorkspaceValidator = require('../validators/CreateWorkspaceValidator');
const add = require('date-fns/add');
const map = require('lodash/map');
const flatten = require('lodash/flatten');
const uniq = require('lodash/uniq');
const compact = require('lodash/compact');
const WorkspaceMembershipListingResource = require('../resources/WorkspaceMembershipListingResource');
const AddWorkspaceUserValidator = require('../validators/AddWorkspaceUserValidator');


class WorkspacesController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Workspaces';

    /**
     * The controller base path
     * 
     * @var string
     */
    basePath = '/workspaces';

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
            handler: 'create',
        },
        {
            type: 'api',
            method: 'get',
            path: '/:workspaceId',
            handler: 'details',
        },
        {
            type: 'api',
            method: 'post',
            path: '/:workspaceId/subscribe',
            handler: 'subscribe',
        },
        {
            type: 'api',
            method: 'get',
            path: '/:workspaceId/users',
            handler: 'usersList',
        },
        {
            type: 'api',
            method: 'post',
            path: '/:workspaceId/users',
            handler: 'addUser',
        },
    ];

    /**
     * Create module subscription for the workspace
     * 
     * @param {*} workspace workspace
     * @param {Module} module module
     * @param {string} period period
     */
    async _createWorkspaceSubscription(workspace, module, period) {
        const currentModules = await workspace.getCurrentModules(this.app);

        const isNew = currentModules.filter(curr => curr.id === module.id).length === 0;
        if (isNew) {
            await workspace.subscribeTo(
                module,
                'Module',
                new Date(),
                period != "lifetime" ? add(new Date(), {
                    years: period === "annually" ? 1 : undefined,
                    months: period === "semi-annually" ? 6 : undefined,
                    weeks: period === "demo" ? 2 : undefined,
                }) : undefined
            );

            const appModule = this.app.module(module.identifier);

            if (!appModule) {
                throw new Error(`Module ${module.identifier} not found`)
            }

            if (appModule.onSubscribe) {
                await appModule.onSubscribe({ workspace, period, subscription });
            }
        }
    }


    /**
     * Get list or all workspaces
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    list() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Injection.register(this.module, 'workspaces.details'),
            async function (req, res, next) {
                try {
                    // const Category = this.app.connection.model('Category');
                    const Workspace = this.app.connection.model('Workspace');

                    const args = req.query;

                    // not include personal workspaces by default
                    // const categories = await Category.find({
                    //     ...(args && args.includePersonals ? {} : {
                    //         identifier: { $ne: 'personal' }
                    //     })
                    // });

                    let search = {
                        identifier: {
                            $ne: 'admin'
                        },
                        // category: {
                        //     $in: categories.map(c => c.id)
                        // }
                    };

                    const sort = args && args.sort ? args.sort : "-createdAt";

                    const query = Workspace.find(search)
                        .populate([
                            { path: 'category' }
                        ])

                    query.sort(sort);

                    const total = await Workspace.find(search).count();

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
     * Create workspace
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    create() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Injection.register(this.module, 'workspaces.create'),
            Validator.validate(new CreateWorkspaceValidator()),
            // Event.register(this.module),
            async function (req, res, next) {
                try {

                    const data = req.body;

                    const Workspace = this.app.connection.model('Workspace');

                    let modified = await Workspace.createNew(data);

                    // if (req.workspace) {
                    //     req.event(new CategoryCreatedOrUpdated(modified, req.wsConnection, req.user));
                    // }

                    let workspace = await Workspace.findById(modified.id).lean({ virtuals: true });
                    workspace = Lang.translate(workspace);

                    return res.json({ ok: true, workspace });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Get workspace details
     * 
     * @param {*} req request
     * @param {*} res response
     */
    details() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Injection.register(this.module, 'main.details'),
            async function (req, res, next) {
                try {

                    const { workspaceId } = req.params;
                    const { wsConnection: connection, inject } = req;

                    const populationInjections = await inject('populate');

                    const Workspace = this.app.connection.model('Workspace');
                    const Module = this.app.connection.model('Module');

                    const workspace = await Doc.resolve(workspaceId, Workspace);

                    const workspaceObject = await Doc.resolve(workspaceId, Workspace)
                        .select('-__v')
                        .populate([
                            ...(populationInjections || [])
                        ])
                        .lean({ virtuals: true });

                    const subscriptions = await workspace.subscriptionsOfType('module', 'active')
                        .select("subscribed validFrom validTill")
                        .populate([
                            {
                                path: "subscribed",
                                model: Module,
                                select: "name identifier",
                            }
                        ])
                        .lean({ virtuals: true });

                    return res.json({
                        ok: true,
                        workspace: {
                            ...Lang.translate(workspaceObject),
                            subscriptions: Lang.translate(subscriptions),
                        }
                    })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Subscribe workspace to apps
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    subscribe() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Injection.register(this.module, 'workspaces.subscribe'),
            Validator.validate(new AddWorkspaceUserValidator(this.app)),
            // Event.register(this.module),
            async function (req, res, next) {
                try {

                    const { modules, period } = req.body;
                    const { workspaceId } = req.params;

                    const Workspace = this.app.connection.model('Workspace');
                    const Module = this.app.connection.model('Module');

                    const workspace = await Workspace.findById(workspaceId);

                    const self = this;
                    const runners = modules.map(
                        function (moduleId) {
                            return async function () {
                                const module = await Doc.resolve(moduleId, Module);
                                await self._createWorkspaceSubscription(workspace, module, period);
                            }
                        }
                    )
                    for (const fn of runners) await fn();

                    workspace.shouldRecreateConnection = true;
                    await workspace.save();

                    return res.json({ ok: true });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Get the workspace users list
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    usersList() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Injection.register(this.module, 'workspaces.usersList'),
            Resource.registerRequest(),
            async function (req, res, next) {
                try {

                    const { workspaceId } = req.params;

                    const Workspace = this.app.connection.model('Workspace');
                    const User = this.app.connection.model('User');
                    const Role = this.app.connection.model('Role');
                    const workspace = await Workspace.findById(workspaceId);

                    const args = req.query;

                    let search = {
                        roles: { $exists: true, $ne: [] }
                    };

                    const sort = args && args.sort ? args.sort : "-createdAt";

                    const query = workspace.memberships(search)
                        .populate([
                            { path: 'user', model: User },
                            { path: 'roles', model: Role },
                        ]);

                    query.sort(sort);

                    const total = await workspace.memberships(search).count();

                    if (args && args.page > -1) {
                        const perPage = args.perPage || 25;
                        query.skip(args.page * perPage)
                            .limit(perPage)
                    }

                    let data = await query.exec();

                    data = await req.toResource(WorkspaceMembershipListingResource, data);

                    return res.json({ ok: true, data, total });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Add owner to the workspace
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    addUser() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Injection.register(this.module, 'workspaces.addUser'),
            Validator.validate(new AddWorkspaceUserValidator(this.app)),
            // Event.register(this.module),
            async function (req, res, next) {
                try {

                    const { workspaceId } = req.params;

                    const Workspace = this.app.connection.model('Workspace');
                    const User = this.app.connection.model('User');
                    // const Role = this.app.connection.model('Role');

                    // const role = await Doc.resolveByIdentifier('owner', Role);
                    return res.json(req.body);

                    let user = await User.findOne({ phone: req.body.phone });
                    if (!user) {
                        const { inject } = req;
                        user = await User.createNew(req.body, { inject });
                    }

                    const workspace = await Workspace.findById(workspaceId);
                    const workspaceCurrentModule = await workspace.getCurrentModules(this.app);

                    const tabBarPins = uniq(flatten(map(workspaceCurrentModule, "defaultTabBarPins")));
                    const homePaths = compact(map(workspaceCurrentModule, "defaultHomePath"));
                    const homePath = homePaths && homePaths.length > 0 && homePaths[0];

                    await workspace.addMember(user, req.body.roles, {
                        tabBarPins,
                        homePath,
                        options: {
                            showWalkthrough: false
                        }
                    });

                    // set workspace as user current
                    await user.setCurrentWorkspace(workspace);

                    return res.json({ ok: true });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }
}

module.exports = WorkspacesController;