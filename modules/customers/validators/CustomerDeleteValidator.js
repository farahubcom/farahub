const mongoose = require("mongoose");
const { Doc } = require("@farahub/framework/facades");

const { ObjectId } = mongoose.Types;


class CustomerDeleteValidator {

    /**
     * The validator rules
     * 
     * @returns {object}
     */
    rules() {
        return {
            personId: {
                in: ["params"],
                isMongoId: {
                    bail: true
                },
                custom: {
                    options: (value, { req }) => {
                        const Person = req.wsConnection.model('Person');
                        return Doc.resolve(value, Person).then(person => {
                            if (!person)
                                return Promise.reject(false);
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
            }
        }
    }

    /**
     * Custom validation formatter
     * 
     * @returns {func}
     */
    toResponse(res, { errors }) {
        return res.status(404).json({
            ok: false,
            message: 'Person not found'
        })
    }
}

module.exports = CustomerDeleteValidator;