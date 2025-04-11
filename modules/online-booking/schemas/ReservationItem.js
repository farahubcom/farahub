const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;


const ReservationItemSchema = new Schema({
    reservation: { type: ObjectId, ref: 'Reservation', required: true },
    service: { type: ObjectId, ref: 'Product', required: true },
    employee: { type: ObjectId, ref: 'Person', required: true },
    time: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    amount: { type: Number, required: true },
    discount: Number,
}, { collection: "beauty_salon_reservations:reservation_items" });

ReservationItemSchema.pre('save', function (next) {
    this.wasNew = this.isNew;
    next();
});

ReservationItemSchema.plugin(mongooseLeanVirtuals);

module.exports = ReservationItemSchema;