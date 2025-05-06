const { Doc } = require("@farahub/framework/facades");

class AddWorkspaceUserValidator {

    /**
     * The application instance
     * 
     * @var Application
     */
    app;

    /**
     * Create validator instance
     * 
     * @param {Application} app
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
            phone: {
                in: ["body"],
                isString: true
            },
            name: {
                in: ["body"],
                isString: true,
                optional: true
            },
            roles: {
                in: ["body"],
                isArray: true,
                custom: {
                    options: async (value, { req }) => {
                        if (!Array.isArray(value) || value.length === 0) {
                            throw new Error('At least one role is required');
                        }
            
                        const Role = this.app.model('Role');
                        const validRoles = ['owner', 'admin'];
                        let hasValidRole = false;
            
                        for (const roleName of value) {
                            // Check if it's a valid role string
                            if (typeof roleName !== 'string' || !validRoles.includes(roleName)) {
                                continue; // Skip invalid roles
                            }
            
                            // Try to find or create the role
                            try {
                                await Role.findOrCreate({
                                    where: { name: roleName },
                                    defaults: { name: roleName }
                                });
                                hasValidRole = true; // At least one valid role exists
                            } catch (error) {
                                // Log error but continue checking other roles
                                console.error(`Failed to process role "${roleName}":`, error);
                            }
                        }
            
                        if (!hasValidRole) {
                            throw new Error('At least one role must be "owner" or "admin"');
                        }
            
                        return true;
                    }
                }
            },
            'roles.*': {
                in: ["body"],
                custom: {
                    options: (value) => {
                        if (typeof value !== 'string' || !['owner', 'admin'].includes(value)) {
                            throw new Error('Each role must be either "owner" or "admin"');
                        }
                        return true;
                    }
                },
                customSanitizer: {
                    options: (value) => value // Keep as string
                }
            }
        }
    }
}

module.exports = AddWorkspaceUserValidator;