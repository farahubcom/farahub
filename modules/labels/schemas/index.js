const Label = require("./Label");
const Product = require("./Product");

const schemas = {
    Label,
    'injects': {
        'Products': {
            Product
        }
    }
}

module.exports = schemas;