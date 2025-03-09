const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;


const InvoiceSchema = new Schema({
    number: { type: Number, required: true },
    type: { type: String, required: true },
    client: { type: ObjectId, ref: 'Person', required: true },
    labels: [{ type: ObjectId, ref: 'Label' }],
    note: String,
    factors: [{
        title: String,
        type: { type: String, enum: ['enhancer', 'reducer'], required: true },
        amount: { type: Number, required: true },
        unit: { type: String, enum: ['percent', 'price'], required: true }
    }],
    issuedAt: { type: Date, required: true },
}, {

    /**
     * Name of the collection
     * 
     * @var string
     */
    collection: "invoices:invoices",

    /**
     * Enable collection timestamps
     * 
     * @var bool
     */
    timestamps: true,
});

InvoiceSchema.virtual('items', {
    ref: 'InvoiceItem',
    localField: '_id',
    foreignField: 'invoice'
});

InvoiceSchema.pre('save', function (next) {
    this.wasNew = this.isNew;
    next();
});

InvoiceSchema.plugin(mongooseLeanVirtuals);

module.exports = InvoiceSchema;