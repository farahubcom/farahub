const mongoose = require("mongoose");
const { Doc } = require("@farahub/framework/facades");

const { ObjectId } = mongoose.Types;

class CreateOrUpdateCustomerValidator {

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
                isMongoId: {
                    bail: true
                },
                custom: {
                    options: (value, { req }) => {
                        const Person = req.wsConnection.model('Person');
                        return Doc.resolve(value, Person).then(person => {
                            if (!person)
                                return Promise.reject('شخص یافت نشد.');
                            return Promise.resolve(true);
                        })
                    },
                    bail: true
                },
                customSanitizer: {
                    options: (value, { req }) => {
                        return ObjectId(value);
                    }
                }
            },
            code: {
                in: ["body"],
                isInt: true,
                toInt: true,
                notEmpty: true,
                errorMessage: "ورود کد اجباری می باشد.",
                custom: {
                    options: (value, { req }) => {

                        if (req.body.id) return true;

                        const Person = req.wsConnection.model('Person');

                        return Person.findOne({ code: value }).then(person => {
                            if (person) {
                                return Promise.reject('کد قبلا ثبت شده است.');
                            }
                        });
                    }
                },
            },
            firstName: {
                in: ["body"],
                isString: true,
                notEmpty: true,
                errorMessage: "نام شخص اجباری است."
            },
            lastName: {
                in: ["body"],
                optional: true,
                isString: true,
            },
            phone: {
                in: ["body"],
                isString: true,
                optional: true,
                custom: {
                    options: (value, { req }) => {
                        // If the value is empty, it's valid (since it's optional)
                        if (!value) {
                            return true;
                        }
                        // If the value is not empty, check if it matches the regex
                        if (!/(09)[0-9]{9}/i.test(value)) {
                            throw new Error("فرمت شماره همراه اشتباه می باشد.");
                        }
                        return true;
                    }
                }
            },
            email: {
                in: ["body"],
                optional: true,
                customSanitizer: {
                    options: (value) => {
                        if (!Boolean(value))
                            return undefined;
                        return value;
                    }
                },
                isEmail: {
                    errorMessage: "فرمت ایمیل اشتباه می باشد."
                },
            },
        }
    }
}

module.exports = CreateOrUpdateCustomerValidator;