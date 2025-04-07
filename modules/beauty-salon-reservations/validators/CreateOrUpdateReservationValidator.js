const { Doc } = require("@farahub/framework/facades");


class CreateOrUpdateReservationValidator {

    /**
     * The validator rules
     * 
     * @returns {object}
     */
    rules() {
        return {
            id: {
                in: ["body"],
                optional: true,
                custom: {
                    options: (value, { req }) => {
                        const Reservation = req.wsConnection.model('Reservation');
                        return Doc.resolve(value, Reservation).then(invoice => {
                            if (!invoice)
                                return Promise.reject('رزرو یافت نشد.');
                            return Promise.resolve(true);
                        })
                    },
                    bail: true
                },
            },
            number: {
                in: ["body"],
                isInt: true,
                toInt: true,
                notEmpty: true,
                errorMessage: "شماره رزرو اجباری می باشد.",
                custom: {
                    options: (value, { req }) => {

                        if (req.body.id) return true;

                        const Reservation = req.wsConnection.model('Reservation');

                        return Reservation.findOne({ number: value }).then(invoice => {
                            if (invoice) {
                                return Promise.reject('شماره قبلا ثبت شده است.');
                            }
                        });
                    }
                },
            },
            customer: {
                in: ["body"],
                optional: true,
                custom: {
                    options: (value, { req }) => {
                        if (!value) return Promise.reject('انتخاب مشتری اجباری می‌باشد.');

                        const Person = req.wsConnection.model('Person');
                        return Doc.resolve(value, Person).then(person => {
                            if (!person)
                                return Promise.reject('مشتری یافت نشد.');
                            return Promise.resolve(true);
                        })
                    },
                    bail: true
                },
            },
            // reservedAt: {
            //     in: ["body"],
            //     isDate: true,
            //     toDate: true,
            //     notEmpty: true,
            //     errorMessage: "تاریخ رزرو اجباری می باشد.",
            // },
            items: {
                in: ["body"],
                isArray: {
                    options: { min: 1 },
                    errorMessage: "حداقل یک آیتم باید وارد شود."
                },
            },
            'items.*.service': {
                custom: {
                    options: (value, { req }) => {
                        if (!value) return Promise.reject('انتخاب خدمت در هر ردیف اجباری می‌باشد.')

                        const Product = req.wsConnection.model('Product');
                        return Doc.resolve(value, Product).then(product => {
                            if (!product)
                                return Promise.reject('خدمت یافت نشد.');
                            return Promise.resolve(true);
                        })
                    },
                    bail: true
                },
            },
            'items.*.employee': {
                custom: {
                    options: (value, { req }) => {
                        if (!value) return Promise.reject('انتخاب کارمند در هر ردیف اجباری می‌باشد.')

                        const Person = req.wsConnection.model('Person');
                        return Doc.resolve(value, Person).then(person => {
                            if (!person)
                                return Promise.reject('کارمند یافت نشد.');
                            return Promise.resolve(true);
                        })
                    },
                    bail: true
                },
            },
            'items.*.time': {
                in: ["body"],
                notEmpty: true,
                errorMessage: "زمان در هر ردیف اجباری می باشد.",
            },
            'items.*.unitPrice': {
                in: ["body"],
                isInt: true,
                toInt: true,
                notEmpty: true,
                errorMessage: "قیمت واحد در هر ردیف اجباری می باشد.",
            },
            'items.*.amount': {
                in: ["body"],
                isInt: true,
                toInt: true,
                notEmpty: true,
                errorMessage: "مقدار در هر ردیف اجباری می باشد.",
            },
            'items.*.discount': {
                in: ["body"],
                optional: true,
                isInt: true,
                toInt: true,
            }
        }
    }
}

module.exports = CreateOrUpdateReservationValidator;