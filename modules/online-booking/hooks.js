const pick = require("lodash/pick");
const setWith = require('lodash/setWith');
const clone = require('lodash/clone');

const hooks = module => ({
    'Core': {
        'workspace.settings.preSave': async ({ workspace, data }) => {
            
            const modifying = pick(data, [
                'online-booking:pricing:default',
                'online-booking:name', 
                'online-booking:headline', 
                'online-booking:about', 
                'online-booking:tel',
                'online-booking:website',
                'online-booking:instagram',
                'online-booking:address',
                'online-booking:latlng'
            ]);

            Object.keys(modifying).forEach((key) => {
                workspace.options = setWith(clone(workspace.options), key, data[key], clone)
            });
        },
    },
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