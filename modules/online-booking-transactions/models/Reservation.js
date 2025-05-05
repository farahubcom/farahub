const { Doc } = require("@farahub/framework/facades");
const sumBy = require("lodash/sumBy");


class Reservation {

    /**
     * Settle the reservation
     * 
     * @return void
     */
    async settle() {
        try {
            const Transaction = this.model('Transaction');

            await Transaction.updateMany(
                {
                    referenceModel: 'Reservation',
                    reference: this.id,
                    client: this.customer,
                    type: Transaction.TYPE_RECEIVEABLE,
                    paidAt: null
                },
                { paidAt: new Date() }
            );
        } catch (error) {
            throw error;
        }
    }

    /**
     * Check if reservation is settled
     */
    async isSettled() {
        try {
            const Reservation = this.model('Reservation');
            const self = await Doc.resolve(this._id, Reservation).populate([{ path: 'items' }])

            const totalPaid = await self.getTotalPaid();

            return self.total >= totalPaid;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get reservation total paid
     */
    async getTotalPaid() {
        try {
            const Transaction = this.model('Transaction');

            const transactions = await Transaction.find({
                referenceModel: 'Reservation',
                reference: this.id,
                client: this.customer,
                type: Transaction.TYPE_RECEIVEABLE,
                paidAt: { $ne: null }
            });

            return sumBy(transactions, 'amount');
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get reservation remaining
     */
    async getRemaining() {
        try {
            const Reservation = this.model('Reservation');
            const self = await Doc.resolve(this._id, Reservation).populate([{ path: 'items' }])

            const totalPaid = await self.getTotalPaid();

            return self.total - totalPaid;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Reservation;