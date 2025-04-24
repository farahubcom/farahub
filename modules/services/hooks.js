const hooks = module => ({
    'Products': {
        'main.list.search': async ({ req, user }) => {
            const args = req.query;

            if (args && args.type) {
                return { type: args.type };
            }

            return {}
        },
        // 'main.list.populate': async () => {
        //     return {
        //         path: 'roles',
        //         select: 'name'
        //     }
        // },
        'main.createOrUpdate.validate': async () => {
            return {
                type: {
                    in: ["body"],
                    optional: true,
                    isString: true,
                },
            }
        },
        // 'main.details.populate': async () => {
        //     return {
        //         path: 'roles',
        //         select: 'name'
        //     }
        // },
        'main.createOrUpdate.preSave': async ({ req, data, connection, inject, product }) => {
            product.type = data.type;
        },
    }
})

module.exports = hooks;