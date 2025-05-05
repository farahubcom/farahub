const Invoice = require("./Invoice");

const schemas = {
    'injects': {
        'Invoices': {
            Invoice
        }
    }
}

module.exports = schemas;