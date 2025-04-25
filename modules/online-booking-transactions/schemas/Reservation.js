const mongoose = require("mongoose");
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const { Schema } = mongoose;


const ReservationSchema = new Schema({
    //
}, {

    /**
     * Name of the collection
     * 
     * @var string
     */
    collection: "beauty_salon_reservations:reservations",

    /**
     * Enable collection timestamps
     * 
     * @var bool
     */
    timestamps: true,
});


ReservationSchema.plugin(mongooseLeanVirtuals);

module.exports = ReservationSchema;