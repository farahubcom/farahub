class InvoiceListingResource {
    constructor(invoice) {
        this.invoice = invoice;
    }

    toJSON() {
        const self = this.invoice;

        return {
            id: self._id,
            customer: {
                id: self.customer?._id,
                fullName: self.customer?.fullName
            },
            note: self.note,
            number: self.number,
            issuedAt: self.issuedAt,
            total: self.total,
        };
    }
}

module.exports = InvoiceListingResource;
