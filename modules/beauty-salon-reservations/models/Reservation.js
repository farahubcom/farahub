const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;


class Reservation {

    /**
     * Generate new number for new creating reservation
     * 
     * @return integer
     */
    static async generateNumber() {
        try {
            const Reservation = this.model('Reservation');
            let number = 0;
            let exist = true;
            while (exist) {
                number += 1;
                exist = await Reservation.findOne({ number });
            }
            return number;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Sync reservation items
     * 
     * @param {Reservation} reservation reservation
     * @param {array} items items to sync
     * @param {Object} args extra arguments
     */
    async syncItems(items, { connection, inject }) {
        const ReservationItem = this.model('ReservationItem');

        if (!this.wasNew) {
            // Remove items that are not in the updated array
            const reservationItems = await ReservationItem.find({ reservation: this.id });
            const itemsIds = reservationItems.map(i => i.id);
            const dataItemsIds = items.map(it => it.id).filter(Boolean);
            const diff = itemsIds.filter(item => !dataItemsIds.includes(item));

            if (diff.length > 0) {
                await ReservationItem.deleteMany({ _id: { $in: diff } });
            }
        }

        // Update the rest
        this.items = await Promise.all(
            items.map(item =>
                ReservationItem.createOrUpdate(
                    { ...item, reservation: this },
                    item.id,
                    { connection, inject }
                )
            )
        );

        // Save reservation
        await this.save();
    }

    /**
     * Create new or update an exsiting reservation
     * 
     * @param {Object} data data
     * @param {string} reservationId updating reservationId
     * @param {Object} options extra options
     * @param {Connection} connection workspace connection
     * @param {func} inject workspace module inject
     * @returns Reservation
     */
    static async createOrUpdate(data, reservationId, { connection, inject }) {
        try {
            const Reservation = this.model('Reservation');

            // create or get reservation instance
            const reservation = reservationId ? await Reservation.findById(ObjectId(reservationId)) : new Reservation();

            // assign customer
            const Person = this.model('Person');
            const customer = await Doc.resolve(data.customer, Person);
            reservation.customer = customer.id;

            // assign pricing
            if (data.pricing) {
                const Pricing = this.model('Pricing');
                const pricing = await Doc.resolve(data.pricing, Pricing);
                reservation.pricing = pricing.id;
            }

            // attach reservation number and date
            reservation.number = data.number || await this.generateNumber();
            reservation.reservedAt = data.reservedAt ? new Date(data.reservedAt) : new Date();

            // assign other fields
            Object.keys(
                pick(data, [
                    'note',
                ])
            ).forEach(key => {
                reservation[key] = data[key];
            });

            // inject pre save hooks
            await inject('preSave', { reservation, data, connection })

            // save changes
            await reservation.save();

            // sync items
            await reservation.syncItems(data.items, { connection, inject });

            // inject post save hooks
            await inject('postSave', { reservation, data, connection })

            // return modified reservation
            return reservation;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Reservation;