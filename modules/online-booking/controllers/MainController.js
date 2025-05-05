const { Controller } = require('@farahub/framework/foundation');
const { Lang, Auth, Workspace, Injection, Doc, Num, Validator } = require('@farahub/framework/facades');
const mongoose = require('mongoose');
const isValid = require('date-fns/isValid');
const fromUnixTime = require('date-fns/fromUnixTime');
const startOfDay = require("date-fns/startOfDay");
const endOfDay = require("date-fns/endOfDay");
const CreateOrUpdateReservationValidator = require('../validators/CreateOrUpdateReservationValidator');


const { ObjectId } = mongoose.Types;

class MainController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Main';

    /**
     * The middleware base path
     *
     * @var string
     */
    basePath = '/reservations';

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
        {
            type: 'api',
            method: 'get',
            path: '/new/number',
            handler: 'newNumber',
        },
        {
            type: 'api',
            method: 'get',
            path: '/quick-access',
            handler: 'quickAccessProducts',
        },
        {
            type: 'api',
            method: 'get',
            path: '/:reservationId',
            handler: 'details',
        },
        {
            type: 'api',
            method: 'delete',
            path: '/:reservationId',
            handler: 'delete',
        },
    ]

    /**
     * List of reservations match params
     * 
     * @return void
     */
    list() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.list'),
            async function (req, res, next) {
                try {

                    const { wsConnection: connection, inject } = req;

                    const Reservation = connection.model('Reservation');
                    const Client = connection.model('Person');

                    const args = req.query;

                    let search = {};

                    if (args && args.number && args.number !== '') {
                        search = { ...search, number: args.number }
                    }

                    if (args && Boolean(args.reservedFrom) && isValid(fromUnixTime(args.reservedFrom))) {
                        search = {
                            ...search,
                            reservedAt: {
                                $gte: startOfDay(fromUnixTime(args.reservedFrom))
                            }
                        }
                    }

                    if (args && Boolean(args.reservedTo) && isValid(fromUnixTime(args.reservedTo))) {
                        search = {
                            ...search,
                            reservedAt: {
                                ...search.reservedAt,
                                $lt: endOfDay(fromUnixTime(args.reservedTo))
                            }
                        }
                    }

                    if (args && args.customer) {
                        const clients = await Client.find(
                            Num.isNumeric(args.customer) ?
                                { code: Number(args.customer) } :
                                {
                                    $or: [
                                        { firstName: { $regex: args.customer + '.*' } },
                                        { lastName: { $regex: args.customer + '.*' } }
                                    ]
                                }
                        );
                        const customerIds = clients.map(customer => customer._id);
                        search = { ...search, customer: { $in: customerIds } };
                    }

                    const sort = args && args.sort ? args.sort : "-createdAt"

                    const populationInjections = await req.inject('populate');
                    const itemPopulationInjections = await req.inject('populate.item');

                    const query = Reservation.find(search)
                        .populate([
                            { path: "customer" },
                            { path: "items" },
                            { path: "items", populate: [{ path: "service" }, { path: "employee" }, ...(itemPopulationInjections || [])] },
                            ...(populationInjections || [])
                        ])

                    query.sort(sort);

                    const total = await Reservation.find(search).count();


                    if (args && args.page > -1) {
                        const perPage = args.perPage || 10;
                        query.skip(args.page * perPage)
                            .limit(perPage)
                    }

                    let data = await query.lean({ virtuals: true });

                    data = Lang.translate(data)

                    return res.json({ ok: true, data, total });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Get new number for new creating reservation
     * 
     * @return void
     */
    newNumber() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.newNumber'),
            async function (req, res, next) {
                try {
                    const Reservation = req.wsConnection.model('Reservation');
                    const number = await Reservation.generateNumber();
                    return res.json({ ok: true, number })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Get details of reservation
     * 
     * @return void
     */
    details() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.details'),
            async function (req, res, next) {
                try {

                    const { reservationId } = req.params;

                    const Reservation = req.wsConnection.model('Reservation');

                    const injections = await req.inject('queryPopulation');

                    let reservation = await Doc.resolve(reservationId, Reservation)
                        .populate([
                            { path: "customer" },
                            { path: "items" },
                            { path: "items", populate: [{ path: "service" }, { path: "employee" }] },
                            ...injections
                        ])
                        .lean({ virtuals: true });


                    reservation = Lang.translate(reservation);

                    return res.json({ ok: true, reservation });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Create or upadte an existing reservation
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
            Validator.validate(new CreateOrUpdateReservationValidator()),
            async function (req, res, next) {
                try {
                    const { inject, wsConnection: connection } = req;

                    const data = req.body;

                    const Reservation = connection.model('Reservation');

                    let reservation = await Reservation.createOrUpdate(data, data.id, { connection, inject });

                    return res.json({ ok: true, reservation })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Delete an existing reservation
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
            async function (req, res, next) {
                try {
                    const { reservationId } = req.params;

                    const { inject, wsConnection: connection } = req;

                    await inject('main.delete.preDelete', { reservationId, connection })

                    // remove all items
                    await connection.model('ReservationItem').deleteMany({
                        reservation: ObjectId(reservationId),
                    });

                    // delete reservation
                    await connection.model('Reservation').findByIdAndDelete(
                        ObjectId(reservationId)
                    )

                    // return response
                    return res.json({ ok: true })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * List of products with quick access label
     * 
     * @return void
     */
    quickAccessProducts() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.quickAccess'),
            async function (req, res, next) {
                try {

                    const args = req.query;
                    const { inject, wsConnection: connection, user } = req;

                    const Product = connection.model('Product');
                    const Label = connection.model('Label');

                    const labelQuickAccess = await Label.findOne({ type: 'reservation-quick-access' });
                    const searchInjections = await inject('search', { user });

                    let search = {
                        labels: labelQuickAccess?.id,
                        ...(searchInjections && Object.assign({},
                            ...searchInjections
                        ))
                    }


                    const sort = args && args.sort ? args.sort : "-createdAt";

                    const populationInjections = await req.inject('populate');

                    const query = Product.find(search)
                        .select('code name description updatedAt')
                        .populate([
                            {
                                path: 'prices',
                                select: 'amount',
                                populate: [
                                    { path: 'pricing', select: 'id name' }
                                ]
                            },
                            ...(populationInjections || [])
                        ]);

                    query.sort(sort);

                    const total = await Product.find(search).count();

                    let data = await query.lean({ virtuals: true });

                    data = Lang.translate(data);

                    return res.json({ ok: true, data, total });
                } catch (error) {
                    next(error)
                }
            }
        ]
    }
}

module.exports = MainController;