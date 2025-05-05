const { Doc } = require("@farahub/framework/facades");
const sumBy = require("lodash/sumBy");


class Invoice {

    /**
     * Settle the invoice
     * 
     * @return void
     */
    async settle() {
        try {
            const Transaction = this.model('Transaction');

            await Transaction.updateMany(
                {
                    referenceModel: 'Invoice',
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
     * Check if invoice is settled
     */
    async isSettled() {
        try {
            const Invoice = this.model('Invoice');
            const self = await Doc.resolve(this._id, Invoice).populate([{ path: 'items' }])

            const totalPaid = await self.getTotalPaid();

            return self.total >= totalPaid;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get invoice total paid
     */
    async getTotalPaid() {
        try {
            const Transaction = this.model('Transaction');

            const transactions = await Transaction.find({
                referenceModel: 'Invoice',
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
     * Get invoice remaining
     */
    async getRemaining() {
        try {
            const Invoice = this.model('Invoice');
            const self = await Doc.resolve(this._id, Invoice).populate([{ path: 'items' }])

            const totalPaid = await self.getTotalPaid();

            return self.total - totalPaid;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Invoice;