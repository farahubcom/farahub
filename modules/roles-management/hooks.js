const hooks = module => ({
    'People': {
        'main.list.populate': async () => {
            return {
                path: 'roles',
                select: 'name'
            }
        },
        'main.createOrUpdate.validate': async () => {
            return {
                roles: {
                    in: ["body"],
                    optional: true,
                    isArray: true,
                },
                'roles.*': {
                    in: ["body"],
                    custom: {
                        options: (value, { req }) => {
                            const Role = req.wsConnection.model('Role');
                            return Doc.resolve(value, Role).then(role => {
                                if (!role)
                                    return Promise.reject(false);
                                return Promise.resolve(true);
                            })
                        },
                        bail: true
                    },
                    customSanitizer: {
                        options: (value, { req }) => {
                            const Role = req.wsConnection.model('Role');
                            return Doc.resolve(value, Role);
                        }
                    }
                }
            }
        },
        'main.details.populate': async () => {
            return {
                path: 'roles',
                select: 'name'
            }
        },
        'main.createOrUpdate.preSave': async ({ data, connection, inject, person }) => {
            person.roles = data.roles?.map(role => role.id);
        },
    }
})

module.exports = hooks;