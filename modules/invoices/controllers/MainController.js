const { Controller } = require('@farahub/framework/foundation');
const { Lang, Auth, Workspace, Injection, Doc, Num, Validator } = require('@farahub/framework/facades');
const mongoose = require('mongoose');
const isValid = require('date-fns/isValid');
const fromUnixTime = require('date-fns/fromUnixTime');
const startOfDay = require("date-fns/startOfDay");
const endOfDay = require("date-fns/endOfDay");
const CreateOrUpdateInvoiceValidator = require('../validators/CreateOrUpdateInvoiceValidator');


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
    basePath = '/invoices';

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
            path: '/default-pricing',
            handler: 'defaultPricing',
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
            path: '/:invoiceId',
            handler: 'details',
        },
        {
            type: 'api',
            method: 'delete',
            path: '/:invoiceId',
            handler: 'delete',
        },
        //
    ]

    /**
     * List of invoices match params
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

                    const Invoice = connection.model('Invoice');
                    const Client = connection.model('Person');

                    const args = req.query;

                    let search = {};

                    // if (req.params && req.params.label) {
                    //     const Label = connection.model('Label');
                    //     const label = await Doc.resolveByIdentifier(req.params.label, Meta);
                    //     search = { ...search, label: label.id };
                    // }

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

                    const query = Invoice.find(search)
                        .populate([
                            { path: "customer" },
                            { path: "items" },
                            { path: "items", populate: [{ path: "item" }, ...(itemPopulationInjections || [])] },
                            ...(populationInjections || [])
                        ])

                    query.sort(sort);

                    const total = await Invoice.find(search).count();


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
     * Get new number for new creating invoice
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
                    const Invoice = req.wsConnection.model('Invoice');
                    const number = await Invoice.generateNumber();
                    return res.json({ ok: true, number })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Get default pricing for invoice
     * 
     * @return void
     */
    defaultPricing() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.defaultPricing'),
            async function (req, res, next) {
                try {
                    const pricing = req.workspace.getOption('invoices:pricing:default', '');
                    return res.json({ ok: true, pricing })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Get details of invoice
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

                    const { invoiceId } = req.params;

                    const Invoice = req.wsConnection.model('Invoice');

                    const injections = await req.inject('queryPopulation');

                    let invoice = await Doc.resolve(invoiceId, Invoice)
                        .populate([
                            { path: "customer" },
                            { path: "items" },
                            { path: "items", populate: [{ path: "item" }] },
                            ...injections
                        ])
                        .lean({ virtuals: true });


                    invoice = Lang.translate(invoice);

                    return res.json({ ok: true, invoice });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Create or upadte an existing invoice
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
            Validator.validate(new CreateOrUpdateInvoiceValidator()),
            async function (req, res, next) {
                try {
                    const { inject, wsConnection: connection } = req;

                    const data = req.body;

                    const Invoice = connection.model('Invoice');

                    let invoice = await Invoice.createOrUpdate(data, data.id, { connection, inject });

                    // // log the activity
                    // const Activity = connection.model('Activity');

                    // await Activity.createNew({
                    //     causer: ObjectId(req.user.id),
                    //     causerModel: 'User',
                    //     subject: invoice.id,
                    //     subjectModel: 'Invoice',
                    //     event: invoice.wasNew ? 'created' : 'updated',
                    // });


                    // invoice = await Invoice.getDetails(
                    //     invoice.id,
                    //     { connection, inject }
                    // )

                    // invoice = Lang.translate(invoice);

                    return res.json({ ok: true, invoice })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Delete an existing invoice from db
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
                    const { invoiceId } = req.params;

                    const { inject, wsConnection: connection } = req;

                    await inject('main.delete.preDelete', { invoiceId, connection })

                    // remove all items
                    await connection.model('InvoiceItem').deleteMany({
                        invoice: ObjectId(invoiceId),
                    });

                    // delete invoice
                    await connection.model('Invoice').findByIdAndDelete(
                        ObjectId(invoiceId)
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

                    const labelQuickAccess = await Label.findOne({ type: 'invoice-quick-access' });
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