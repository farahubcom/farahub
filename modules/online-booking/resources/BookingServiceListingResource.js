class BookingServiceListingResource {
    constructor(service) {
        this.service = service;
    }

    toJSON() {
        const self = this.service;

        return {
            id: self._id,
            name: self.name,
        };
    }
}

module.exports = BookingServiceListingResource;
