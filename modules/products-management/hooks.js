const hooks = module => ({
    'Products': {
        'main.list.search': async ({ req, user }) => {
            const args = req.query;

            if (args && args.type) {
                return { type: args.type };
            }

            return {}
        },
        'main.createOrUpdate.validate': async () => {
            return {
                type: {
                    in: ["body"],
                    optional: true,
                    isString: true,
                },
            }
        },
        'main.createOrUpdate.preSave': async ({ req, data, connection, inject, product }) => {
            product.type = data.type;
        },
    }
})

module.exports = hooks;