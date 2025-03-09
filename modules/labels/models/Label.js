const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;


class Label {

    /**
     * Create new or update an existing label
     * 
     * @param {Object} data label data created
     * @return {Label} modified label
     */
    static async createOrUpdate(data, labelId, { inject, connection }) {
        try {
            const Label = this.model('Label');

            // create instance
            const label = labelId ? await Label.findById(ObjectId(labelId)) : new Label();

            if (label.isNew) {

                // assign type
                label.type = data.type;

                // assign identifier
                if (data.identifier) {
                    label.identifier = data.identifier;
                }
            }

            // assign name
            label.name = {
                'fa-IR': data.name
            };

            // inject pre save hooks
            await inject('preSave', { label, data, labelId })

            // save document
            await label.save();

            // inject post save hooks
            await inject('postSave', { label, data, labelId })

            // return modified label
            return label;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Label;