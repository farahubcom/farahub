class BookingEmployeeListingResource {
    constructor(employee) {
        this.employee = employee;
    }

    toJSON() {
        const self = this.employee;

        return {
            id: self._id,
            name: self.fullName,
        };
    }
}

module.exports = BookingEmployeeListingResource;
