class MemberListingResource {
    constructor(customer) {
        this.customer = customer;
    }

    toJSON() {
        const self = this.customer;

        return {
            id: self._id,
            code: self.code,
            firstName: self.firstName,
            lastName: self.lastName,
            fullName: self.fullName,
        };
    }
}

module.exports = MemberListingResource;
