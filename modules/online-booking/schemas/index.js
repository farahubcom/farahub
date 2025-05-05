const Product = require("./Product");
const Reservation = require("./Reservation");
const ReservationItem = require("./ReservationItem");

const schemas = {
    Reservation,
    ReservationItem,
    'injects': {
        'Products': {
            Product
        }
    }
}

module.exports = schemas;