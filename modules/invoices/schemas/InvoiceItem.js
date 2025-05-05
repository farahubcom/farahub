const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;


const InvoiceItemSchema = new Schema({
    invoice: { type: ObjectId, ref: 'Invoice', required: true },
    item: { type: ObjectId, ref: 'Product', required: true },
    amount: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    discount: Number,
}, { collection: "invoices:invoice_items" });

InvoiceItemSchema.pre('save', function (next) {
    this.wasNew = this.isNew;
    next();
});

InvoiceItemSchema.plugin(mongooseLeanVirtuals);

module.exports = InvoiceItemSchema;