const { Doc } = require('@farahub/framework/facades');
const mongoose = require("mongoose");
const pick = require("lodash/pick");
const sumBy = require('lodash/sumBy');

const { ObjectId } = mongoose.Types;


class Invoice {

    /**
     * Generate new number for new creating invoice
     * 
     * @return integer
     */
    static async generateNumber() {
        try {
            const Invoice = this.model('Invoice');
            let number = 0;
            let exist = true;
            while (exist) {
                number += 1;
                exist = await Invoice.findOne({ number });
            }
            return number;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Sync invoice items
     * 
     * @param {Invoice} invoice invoice
     * @param {array} items items to sync
     * @param {Object} args extra arguments
     */
    async syncItems(items, { connection, inject }) {
        const InvoiceItem = this.model('InvoiceItem');

        if (!this.wasNew) {
            // Remove items that are not in the updated array
            const invoiceItems = await InvoiceItem.find({ invoice: this.id });
            const itemsIds = invoiceItems.map(i => i.id);
            const dataItemsIds = items.map(it => it.id).filter(Boolean);
            const diff = itemsIds.filter(item => !dataItemsIds.includes(item));

            if (diff.length > 0) {
                await InvoiceItem.deleteMany({ _id: { $in: diff } });
            }
        }

        // Update the rest
        this.items = await Promise.all(
            items.map(item =>
                InvoiceItem.createOrUpdate(
                    { ...item, invoice: this },
                    item.id,
                    { connection, inject }
                )
            )
        );

        // Save invoice
        await this.save();
    }

    /**
     * Create new or update an exsiting invoice
     * 
     * @param {Object} data data
     * @param {string} invoiceId updating invoiceId
     * @param {Object} options extra options
     * @param {Connection} connection workspace connection
     * @param {func} inject workspace module inject
     * @returns Invoice
     */
    static async createOrUpdate(data, invoiceId, { connection, inject }) {
        try {
            const Invoice = this.model('Invoice');

            // create or get invoice instance
            const invoice = invoiceId ? await Invoice.findById(ObjectId(invoiceId)) : new Invoice();

            // assign labels
            invoice.labels = data.labels;

            // assign customer
            const Person = this.model('Person');
            const customer = await Doc.resolve(data.customer, Person);
            invoice.customer = customer.id;

            // assign pricing
            if (data.pricing) {
                const Pricing = this.model('Pricing');
                const pricing = await Doc.resolve(data.pricing, Pricing);
                invoice.pricing = pricing.id;
            }

            // attach invoice number and date
            invoice.number = data.number || await this.generateNumber();
            invoice.issuedAt = data.issuedAt ? new Date(data.issuedAt) : new Date();

            // assign other fields
            Object.keys(
                pick(data, [
                    'note',
                ])
            ).forEach(key => {
                invoice[key] = data[key];
            });

            // inject pre save hooks
            await inject('preSave', { invoice, data, connection })

            // save changes
            await invoice.save();

            // sync items
            await invoice.syncItems(data.items, { connection, inject });

            // inject post save hooks
            await inject('postSave', { invoice, data, connection })

            // return modified invoice
            return invoice;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get invoice subtotal
     * 
     * @returns {Number}
     */
    get subtotal() {
        return sumBy(this.items, (item) => item.total);
        // return sumBy(this.items, (item) => (item.unitPrice * (item.amount || 1)) - (item.discount || 0));
    }

    /**
     * Get invoice total
     * 
     * @returns {Number}
     */
    get total() {
        let subtotal = this.subtotal;
        return subtotal + (this.factors ? sumBy(this.factors, factor => {
            return (
                factor.unit === 'price' ?
                    factor.amount :
                    (factor.amount / 100 * subtotal)
            ) * (factor.type === 'reducer' ? -1 : 1);
        }) : 0);
    }
}

module.exports = Invoice;