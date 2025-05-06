class WorkspaceMembershipListingResource {
    constructor(membership) {
        this.membership = membership;
    }

    toJSON() {
        const self = this.membership;

        return {
            id: self._id,
            user: {
                id: self.user?._id,
                name: self.user?.name,
                username: self.user?.username,
                phone: self.user?.phone,
            },
            roles: self.roles.map(role => ({
                id: role.id,
                identifier: role.identifier,
                name: role.name.get('fa-IR')
            }))
        };
    }
}

module.exports = WorkspaceMembershipListingResource;
