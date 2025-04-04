const { Doc, Injection } = require('@farahub/framework/facades');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;


const hooks = (module) => ({
    'Invoices': {
        'main.createOrUpdate.postSave': async ({ invoice, data, invoiceId, connection }) => {
            if (!data.id) {
                const Transaction = connection.model('Transaction');
                const Client = connection.model('Person');

                const client = await Doc.resolve(invoice.customer, Client);
                const deposit = data.deposit ? Number(data.deposit) : 0;

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
            }

            await invoice.calculateRemaining();
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
    },
})

module.exports = hooks;