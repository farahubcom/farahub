const { Doc } = require('@farahub/framework/facades');
const pick = require("lodash/pick");
const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;


class InvoiceItem {

    /**
     * Create new or update an exsiting invoice item
     * 
     * @param {Object} data data
     * @param {string} itemId updating itemId
     * @param {Object} options extra options
     * @param {Connection} connection workspace connection
     * @returns InvoiceItem
     */
    static async createOrUpdate(data, itemId, { inject, connection }) {
        try {

            const InvoiceItem = this.model('InvoiceItem');

            // create or get invoice item instance
            const item = itemId ? await InvoiceItem.findById(ObjectId(itemId)) : new InvoiceItem();

            // assign item invoice & product
            if (item.isNew) {

                // assign item invoice
                const Invoice = this.model('Invoice');
                const invoice = await Doc.resolve(data.invoice, Invoice);
                item.invoice = invoice.id;

                // assign item product
                const Product = this.model('Product');
                const product = await Doc.resolve(data.item, Product);
                item.item = product.id;
            }

            // assign rest of fields
            Object.keys(
                pick(data, [
                    'amount',
                    'unitPrice',
                    'discount',
                ])
            ).forEach(key => {
                item[key] = data[key];
            });

            // inject pre save hooks
            await inject('itemPreSave', { item, data, itemId, connection })

            // save changes
            await item.save();

            // inject post save hooks
            await inject('itemPostSave', { item, data, itemId, connection })

            // return modified item
            return item;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get item total
     * 
     * @returns {Number}
     */
    get total() {
        return this.unitPrice * (this.amount || 1) - (this.discount || 0);
    }
}

module.exports = InvoiceItem;