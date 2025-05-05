const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const { Schema } = mongoose;


const LabelSchema = new Schema({
    identifier: { type: String, unique: true, sparse: true, lowercase: true },
    name: { type: Map, of: String, required: true },
    type: { type: String, required: true },
}, {

    /**
     * Name of the collection
     * 
     * @var string
     */
    collection: "labels:labels",

    /**
     * Enable collection timestamps
     * 
     * @var bool
     */
    timestamps: true,
});

LabelSchema.pre('save', function (next) {
    this.wasNew = this.isNew;
    next();
});

LabelSchema.plugin(mongooseLeanVirtuals);

module.exports = LabelSchema;