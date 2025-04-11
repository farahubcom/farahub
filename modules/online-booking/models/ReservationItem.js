const { Doc } = require('@farahub/framework/facades');
const pick = require("lodash/pick");
const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;


class ReservationItem {

    /**
     * Create new or update an exsiting reservation item
     * 
     * @param {Object} data data
     * @param {string} itemId updating itemId
     * @param {Object} options extra options
     * @param {Connection} connection workspace connection
     * @returns ReservationItem
     */
    static async createOrUpdate(data, itemId, { inject, connection }) {
        try {
            const ReservationItem = this.model('ReservationItem');

            // create or get reservation item instance
            const item = itemId ? await ReservationItem.findById(ObjectId(itemId)) : new ReservationItem();

            if (item.isNew) {
                // assign item reservation
                const Reservation = this.model('Reservation');
                const reservation = await Doc.resolve(data.reservation, Reservation);
                item.reservation = reservation.id;
            }

            // assign item service
            const Product = this.model('Product');
            const service = await Doc.resolve(data.service, Product);
            item.service = service.id;

            // assign item employee
            const Person = this.model('Person');
            const person = await Doc.resolve(data.employee, Person);
            item.employee = person.id;

            // assign item date
            item.date = data.date ? new Date(data.date) : new Date();

            // assign rest of fields
            Object.keys(
                pick(data, [
                    'time',
                    'unitPrice',
                    'amount',
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

module.exports = ReservationItem;