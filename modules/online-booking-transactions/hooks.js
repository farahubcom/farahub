const { Doc, Injection } = require('@farahub/framework/facades');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;


const hooks = (module) => ({
    'Online-Booking': {
        'main.createOrUpdate.postSave': async ({ reservation, data, reservationId, connection }) => {
            const Transaction = connection.model('Transaction');
            const Client = connection.model('Person');

            const client = await Doc.resolve(reservation.customer, Client);
            const deposit = data.deposit ? Number(data.deposit) : 0;

            if (!data.id) {
                if (deposit > 0) {
                    const transaction = await Transaction.createOrUpdate({
                        amount: deposit,
                        customer: client,
                        type: Transaction.TYPE_RECEIVEABLE,
                        createdAt: reservation.createdAt,
                        referenceModel: 'Reservation',
                        reference: reservation.id
                    }, null, {
                        connection,
                        inject: Injection.register(module.app.module('Transactions'), 'main.createOrUpdate', { withRequest: false })
                    });

                    await transaction.markPaid();
                }
            } else {
                const reservationDepositTranstionQueryFilter = {
                    referenceModel: 'Reservation',
                    reference: reservation.id,
                    type: Transaction.TYPE_RECEIVEABLE,
                    createdAt: reservation.createdAt,
                }

                if (deposit > 0) {
                    const transaction = await Transaction.findOne(reservationDepositTranstionQueryFilter);

                    transaction.amount = deposit;
                    await transaction.save();
                } else {
                    await Transaction.deleteOne(reservationDepositTranstionQueryFilter);
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
        'main.delete.preDelete': async ({ reservationId, connection }) => {

            // remove all related transactions
            await connection.model('Transaction').deleteMany({
                referenceModel: 'Reservation',
                reference: ObjectId(reservationId),
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