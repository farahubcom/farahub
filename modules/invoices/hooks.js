const pick = require("lodash/pick");
const setWith = require('lodash/setWith');
const clone = require('lodash/clone');

const hooks = {
    'Core': {
        'workspace.settings.preSave': async ({ workspace, data }) => {

            const modifying = pick(data, [
                'invoices:pricing:default',
            ]);

            Object.keys(modifying).forEach((key) => {
                workspace.options = setWith(clone(workspace.options), key, data[key], clone)
            });
        },
    }
}

module.exports = hooks;