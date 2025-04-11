const pick = require("lodash/pick");
const setWith = require('lodash/setWith');
const clone = require('lodash/clone');

const hooks = module => ({
    'Core': {
        'workspace.settings.preSave': async ({ workspace, data }) => {
            
            const modifying = pick(data, [
                'beauty-salon-reservations:pricing:default',
                'beauty-salon-reservations:online-booking:name', 
                'beauty-salon-reservations:online-booking:headline', 
                'beauty-salon-reservations:online-booking:about', 
                'beauty-salon-reservations:online-booking:tel',
                'beauty-salon-reservations:online-booking:website',
                'beauty-salon-reservations:online-booking:instagram',
                'beauty-salon-reservations:online-booking:address',
                'beauty-salon-reservations:online-booking:latlng'
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