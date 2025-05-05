const { Doc, Injection } = require('@farahub/framework/facades');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;


const hooks = (module) => ({
    'Invoices': {
        'main.createOrUpdate.postSave': async ({ invoice, data, invoiceId, connection }) => {
            const Transaction = connection.model('Transaction');
            const Client = connection.model('Person');

            const client = await Doc.resolve(invoice.customer, Client);
            const deposit = data.deposit ? Number(data.deposit) : 0;

            if (!data.id) {
                if (deposit > 0) {
                    const transaction = await Transaction.createOrUpdate({
                        amount: deposit,
                        client: client,
                        type: Transaction.TYPE_RECEIVEABLE,
                        createdAt: invoice.createdAt,
                        referenceModel: 'Invoice',
                        reference: invoice.id
                    }, null, {
                        connection,
                        inject: Injection.register(module.app.module('Transactions'), 'main.createOrUpdate', { withRequest: false })
                    });

                    await transaction.markPaid();
                }
            } else {
                const invoiceDepositTranstionQueryFilter = {
                    referenceModel: 'Invoice',
                    reference: invoice.id,
                    type: Transaction.TYPE_RECEIVEABLE,
                    createdAt: invoice.createdAt,
                }

                if (deposit > 0) {
                    const transaction = await Transaction.findOne(invoiceDepositTranstionQueryFilter);

                    transaction.amount = deposit;
                    await transaction.save();
                } else {
                    await Transaction.deleteOne(invoiceDepositTranstionQueryFilter);
                }
            }
        },
        'main.createOrUpdate.validator': () => {
            return {
                'deposit': {
                    in: ["body"],
                    isInt: true,
                    toInt: true,
                    optional: true,
                }
            }
        },
        'main.delete.preDelete': async ({ invoiceId, connection }) => {

            // remove all related transactions
            await connection.model('Transaction').deleteMany({
                referenceModel: 'Invoice',
                reference: ObjectId(invoiceId),
            });
        },
        'main.list.resource': async ({ req, resource }) => {
            const totalPaid = await resource.getTotalPaid();
            const remaining = await resource.getRemaining();
            return { totalPaid, remaining }
        }
    },
})

module.exports = hooks;