const mongoose = require("mongoose");
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;


const ProductSchema = new Schema({

    /**
     * Service duration time in HH:mm format
     * 
     * @var string
     */
    serviceTime: String
}, {

    /**
     * Name of the collection
     * 
     * @var string
     */
    collection: "products:products",

    /**
     * Enable collection timestamps
     * 
     * @var bool
     */
    timestamps: true,
});

ProductSchema.pre('save', function (next) {
    this.wasNew = this.isNew;
    next();
});

ProductSchema.plugin(mongooseLeanVirtuals);

module.exports = ProductSchema;