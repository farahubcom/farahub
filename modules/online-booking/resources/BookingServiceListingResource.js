class BookingServiceListingResource {
    constructor(service) {
        this.service = service;
    }

    toJSON() {
        const self = this.service;

        return {
            id: self._id,
            name: self.name.get('fa-IR'),
        };
    }
}

module.exports = BookingServiceListingResource;
