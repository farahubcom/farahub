const { Injection, Resource, Workspace, Auth, Doc } = require('@farahub/framework/facades');
const { Controller } = require('@farahub/framework/foundation');
const WorkspaceResource = require('../resources/WorkspaceResource');
const BookingServiceListingResource = require('../resources/BookingServiceListingResource');
const BookingEmployeeListingResource = require('../resources/BookingEmployeeListingResource');


class OnlineBookingController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Booking';

    /**
     * The controller name
     * 
     * @var string
     */
    basePath = '';

    /**
     * The controller routes
     * 
     * @var array
     */
    routes = [
        {
            type: 'api',
            method: 'get',
            path: '/workspace/@:workspaceId',
            handler: 'getWorkspace',
        },
        {
            type: 'api',
            method: 'get',
            path: '/services',
            handler: 'getServices',
        },
        {
            type: 'api',
            method: 'get',
            path: '/employees',
            handler: 'getEmployees',
        },
        {
            type: 'api',
            method: 'post',
            path: '/booking',
            handler: 'submit',
        },
    ]

    /**
     * Get workspace data by identifier
     */
    getWorkspace() {
        return [
            Injection.register(this.module, 'onlineBooking.getWorkspace'),
            Resource.registerRequest(),
            async function (req, res, next) {
                try {
                    const { workspaceId } = req.params;

                    const Workspace = await this.app.connection.model('Workspace');

                    const workspaceDocument = await Workspace.findOne({ identifier: workspaceId });

                    if (!workspaceDocument) {
                        return res.sendStatus(404);
                    }

                    const workspace = await req.toResource(WorkspaceResource, workspaceDocument);
                    return res.json({ ok: true, workspace }); l
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Get workspace services data
     */
    getServices() {
        return [
            Workspace.resolve(this.app),
            Injection.register(this.module, 'onlineBooking.getServices'),
            Resource.registerRequest(),
            async function (req, res, next) {
                try {
                    const Product = await req.wsConnection.model('Product');

                    const services = await Product.find();

                    const data = await req.toResource(BookingServiceListingResource, services);

                    return res.json({ ok: true, data });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Get workspace employees data
     */
    getEmployees() {
        return [
            Workspace.resolve(this.app),
            Injection.register(this.module, 'onlineBooking.getEmployees'),
            Resource.registerRequest(),
            async function (req, res, next) {
                try {
                    const Person = await req.wsConnection.model('Person');
                    const Role = req.wsConnection.model('Role');

                    const role = await Doc.resolveByIdentifier('employee', Role)
                    const employees = await Person.find({ roles: role?.id });

                    const data = await req.toResource(BookingEmployeeListingResource, employees);

                    return res.json({ ok: true, data });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Submit booking
     */
    submit() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'onlineBooking.submit'),
            Resource.registerRequest(),
            async function (req, res, next) {
                try {
                    const { workspaceId } = req.params;

                    const Workspace = await this.app.connection.model('Workspace');

                    const workspaceDocument = await Workspace.findOne({ identifier: workspaceId });

                    if (!workspaceDocument) {
                        return res.sendStatus(404);
                    }

                    const workspace = await req.toResource(WorkspaceResource, workspaceDocument);
                    return res.json({ ok: true, workspace }); l
                } catch (error) {
                    next(error);
                }
            }
        ]
    }
}

module.exports = OnlineBookingController;