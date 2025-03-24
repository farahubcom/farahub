const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;


const ReservationSchema = new Schema({
    number: { type: Number, unique: true, required: true },
    customer: { type: ObjectId, ref: 'Person', required: true },
    note: String,
    reservedAt: { type: Date, required: true },
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

ReservationSchema.virtual('items', {
    ref: 'ReservationItem',
    localField: '_id',
    foreignField: 'reservation'
});

ReservationSchema.pre('save', function (next) {
    this.wasNew = this.isNew;
    next();
});

ReservationSchema.plugin(mongooseLeanVirtuals);

module.exports = ReservationSchema;