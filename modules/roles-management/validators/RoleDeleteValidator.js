const mongoose = require("mongoose");
const { Doc } = require("@farahub/framework/facades");

const { ObjectId } = mongoose.Types;


class RoleDeleteValidator {

    /**
     * The validator rules
     * 
     * @returns {object}
     */
    rules() {
        return {
            roleId: {
                in: ["params"],
                isMongoId: {
                    bail: true
                },
                custom: {
                    options: (value, { req }) => {
                        const Role = req.wsConnection.model('Role');
                        return Doc.resolve(value, Role).then(role => {
                            if (!role)
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
            message: 'Role not found'
        })
    }
}

module.exports = RoleDeleteValidator;