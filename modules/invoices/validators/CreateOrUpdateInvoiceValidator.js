const { Doc } = require("@farahub/framework/facades");

class CreateOrUpdateInvoiceValidator {

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
                        const Invoice = req.wsConnection.model('Invoice');
                        return Doc.resolve(value, Invoice).then(invoice => {
                            if (!invoice)
                                return Promise.reject('فاکتور یافت نشد.');
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
                errorMessage: "شماره فاکتور اجباری می باشد.",
                custom: {
                    options: (value, { req }) => {

                        if (req.body.id) return true;

                        const Invoice = req.wsConnection.model('Invoice');

                        return Invoice.findOne({ number: value }).then(invoice => {
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
            pricing: {
                in: ["body"],
                optional: true,
                custom: {
                    options: (value, { req }) => {
                        const Pricing = req.wsConnection.model('Pricing');
                        return Doc.resolve(value, Pricing).then(pricing => {
                            if (!pricing)
                                return Promise.reject('تعرفه یافت نشد.');
                            return Promise.resolve(true);
                        })
                    },
                    bail: true
                },
            },
            // issuedAt: {
            //     in: ["body"],
            //     isDate: true,
            //     toDate: true,
            //     notEmpty: true,
            //     errorMessage: "تاریخ صدور اجباری می باشد.",
            // },
            items: {
                in: ["body"],
                isArray: {
                    options: { min: 1 },
                    errorMessage: "حداقل یک آیتم باید وارد شود."
                },
            },
            'items.*.item': {
                in: ["body"],
                custom: {
                    options: (value, { req }) => {
                        const Product = req.wsConnection.model('Product');
                        return Doc.resolve(value, Product).then(product => {
                            if (!product)
                                return Promise.reject('کالا/خدمت یافت نشد.');
                            return Promise.resolve(true);
                        })
                    },
                    bail: true
                },
            },
            'items.*.unitPrice': {
                in: ["body"],
                isInt: true,
                toInt: true,
                notEmpty: true,
                errorMessage: "فی اجباری می باشد.",
            },
            'items.*.amount': {
                in: ["body"],
                isInt: true,
                toInt: true,
                notEmpty: true,
                errorMessage: "مقدار اجباری می باشد.",
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

module.exports = CreateOrUpdateInvoiceValidator;