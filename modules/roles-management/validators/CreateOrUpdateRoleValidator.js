const mongoose = require("mongoose");
const { Doc } = require("@farahub/framework/facades");

const { ObjectId } = mongoose.Types;


class CreateOrUpdateRoleValidator {

    /**
     * The application instance
     * 
     * @var Application
     */
    app;

    /**
     * Create validator instance
     * 
     * @constructor
     */
    constructor(app) {
        this.app = app;
    }

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
                        const Role = req.wsConnection.model('Role');
                        return Doc.resolve(value, Role).then(role => {
                            if (!role)
                                return Promise.reject('نقش یافت نشد.');
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
            name: {
                in: ["body"],
                isString: true,
                notEmpty: true,
                errorMessage: "نام نقش اجباری است."
            },
            access: {
                in: ["body"],
                isArray: {
                    options: {
                        min: 1
                    }
                },
            },
            'access.*.permission': {
                in: ["body"],
                // isMongoId: {
                //     bail: true
                // },
                custom: {
                    options: (value, { req }) => {
                        const Permission = this.app.connection.model('Permission');
                        return Doc.resolve(value, Permission).then(permission => {
                            if (!permission)
                                return Promise.reject('مجوز یافت نشد.');
                            return Promise.resolve(true);
                        })
                    },
                    bail: true
                },
                customSanitizer: {
                    options: (value, { req }) => {
                        const Permission = this.app.connection.model('Permission');
                        return Doc.resolve(value, Permission);
                    }
                }
            }
        }
    }
}

module.exports = CreateOrUpdateRoleValidator;