const { Controller } = require('@farahub/framework/foundation');
const isValid = require('date-fns/isValid');
const fromUnixTime = require('date-fns/fromUnixTime');
const startOfDay = require("date-fns/startOfDay");
const endOfDay = require("date-fns/endOfDay");
const { Workspace, Auth, Doc } = require('@farahub/framework/facades');


class ReportsController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Reports';

    /**
     * The controller routes
     * 
     * @var array
     */
    routes = [
        {
            type: 'api',
            method: 'get',
            path: '/reports/employees-income',
            handler: 'employeesIncome',
        },
    ]

    /**
     * Get a list of all contract transactions
     * 
     * @return void
     */
    employeesIncome() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            async (req, res, next) => {
                try {
                    const Person = req.wsConnection.model('Person');
                    const Role = req.wsConnection.model('Role');
            
                    const args = req.query;
            
                    // Resolve role
                    const role = await Doc.resolveByIdentifier('employee', Role);
                    const roleMatch = role?._id ? { roles: role._id } : { _id: null };
            
                    // Date range filtering
                    let dateFilter = null;
                    if (args && args.fromDate && isValid(fromUnixTime(args.fromDate))) {
                        dateFilter.$gte = startOfDay(fromUnixTime(args.fromDate));
                    }
                    if (args && args.toDate && isValid(fromUnixTime(args.toDate))) {
                        dateFilter.$lt = endOfDay(fromUnixTime(args.toDate));
                    }
            
                    // Aggregate pipeline to calculate person income from commissions
                    const result = await Person.aggregate([
                        {
                            $match: roleMatch
                        },
                        {
                            $lookup: {
                                from: 'invoices:invoice_items',
                                let: { personId: '$_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ['$member', '$$personId'] },
                                                    { $gt: ['$commissonPercent', 0] }
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: 'invoices:invoices',
                                            localField: 'invoice',
                                            foreignField: '_id',
                                            as: 'invoice'
                                        }
                                    },
                                    { $unwind: '$invoice' },
                                    {
                                        $match: dateFilter ? {
                                            'invoice.issuedAt': dateFilter
                                        } : {}
                                    },
                                    {
                                        $project: {
                                            commission: {
                                                $multiply: [
                                                    { $multiply: ['$amount', '$unitPrice'] },
                                                    { $divide: ['$commissonPercent', 100] }
                                                ]
                                            },
                                            serviceCount: 1
                                        }
                                    }
                                ],
                                as: 'commissionItems'
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                code: 1,
                                firstName: 1,
                                lastName: 1,
                                phone: 1,
                                email: 1,
                                totalIncome: { $sum: '$commissionItems.commission' },
                                totalServices: { $size: '$commissionItems' },
                                commissionItems: 1
                            }
                        },
                        {
                            $sort: { totalIncome: -1 }
                        }
                    ]);
            
                    return res.json({ ok: true, data: result, total: result.length });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }
}

module.exports = ReportsController;