const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;


const InvoiceItemSchema = new Schema({
    commissonPercent: Number,
    member: { type: ObjectId, ref: 'Person' },
}, { collection: "invoices:invoice_items" });

InvoiceItemSchema.pre('save', function (next) {
    this.wasNew = this.isNew;
    next();
});

InvoiceItemSchema.plugin(mongooseLeanVirtuals);

module.exports = InvoiceItemSchema;