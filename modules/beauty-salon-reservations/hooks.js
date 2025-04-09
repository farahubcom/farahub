const hooks = module => ({
    'Products': {
        'main.createOrUpdate.validate': async () => {
            return {
                serviceTime: {
                    in: ["body"],
                    optional: true,
                    custom: {
                        options: (value) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value),
                        errorMessage: "مقدار زمان خدمت اشتباه است."
                    }
                },
            }
        },
        'main.createOrUpdate.preSave': async ({ data, connection, inject, product }) => {
            product.serviceTime = data.serviceTime;
        },
    }
})

module.exports = hooks;