const mongoose = require("mongoose");
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;


const WorkspaceSchema = new Schema({
    name: { type: Map, of: String },
    identifier: { type: String, unique: true },
    hostname: { type: String, unique: true, sparse: true },
    category: { type: ObjectId, ref: 'Category' },
    description: { type: Map, of: String },
    options: Object,
    dbUrl: { type: String, select: false },
    picture: String,


    // Flag that determine workspace connection should be recreated
    shouldRecreateConnection: { type: Boolean, default: false },
}, {

    /**
     * Name of the collection
     * 
     * @var string
     */
    collection: "core:workspaces",

    /**
     * Enable collection timestamps
     * 
     * @var bool
     */
    timestamps: true,
});

WorkspaceSchema.virtual('_memberships', {
    ref: 'Membership',
    localField: '_id',
    foreignField: 'workspace',
});

WorkspaceSchema.plugin(mongooseLeanVirtuals);

module.exports = WorkspaceSchema;