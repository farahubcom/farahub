class WorkspaceResource {
    constructor(workspace) {
        this.workspace = workspace;
    }

    toJSON() {
        const self = this.workspace;

        return {
            id: self._id,
            name: self.getOption('online-booking:name', self.name.get('fa-IR')),
            headline: self.getOption('online-booking:headline'),
            about: self.getOption('online-booking:about'),
            tel: self.getOption('online-booking:tel'),
            website: self.getOption('online-booking:website'),
            instagram: self.getOption('online-booking:instagram'),
            address: self.getOption('online-booking:address'),
            latlng: self.getOption('online-booking:latlng'),
        };
    }
}

module.exports = WorkspaceResource;
