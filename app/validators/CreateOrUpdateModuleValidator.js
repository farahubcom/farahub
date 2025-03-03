const mongoose = require("mongoose");
const fs = require('fs');
const { Doc } = require("@farahub/framework/facades");

const { ObjectId } = mongoose.Types;


class CreateOrUpdateModuleValidator {

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
            name: {
                in: ["body"],
                isString: {
                    bail: true
                },
                notEmpty: {
                    bail: true,
                    errorMessage: 'ورود نام ماژول اجباری است'
                }
            },
            identifier: {
                in: ["body"],
                isString: true,
                notEmpty: {
                    bail: true,
                    errorMessage: 'شناسه ماژول اجباری است'
                },
                custom: {
                    options: (value, { req }) => {
                        // Construct the package name
                        const packageName = `@farahub/${value}`;

                        // Read the package.json file
                        const packageJsonPath = path.join(process.cwd(), 'package.json');
                        if (!fs.existsSync(packageJsonPath)) {
                            throw new Error('فایل package.json یافت نشد.');
                        }

                        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

                        // Check if the package exists in dependencies or devDependencies
                        const dependencies = packageJson.dependencies || {};
                        const devDependencies = packageJson.devDependencies || {};

                        if (!dependencies[packageName] && !devDependencies[packageName]) {
                            throw new Error(`پکیج ${packageName} در package.json یافت نشد.`);
                        }

                        return true;
                        // if (!fs.existsSync(this.app.getModulesPath(value))) {
                        //     throw new Error('مسیری با این شناسه وجود ندارد.');
                        // }

                        return true;
                    }
                },
            },
            description: {
                in: ["body"],
                isString: true,
                optional: true
            },
            readme: {
                in: ["body"],
                isString: true,
                optional: true
            },
            micro: {
                in: ["body"],
                isBoolean: true,
                toBoolean: true
            },
            maintenance: {
                in: ["body"],
                isBoolean: true,
                toBoolean: true
            },
            monthlyCost: {
                in: ["body"],
                optional: true,
                customSanitizer: {
                    options: (value, { req }) => {
                        if (value === "") return 0;
                        return value;
                    }
                },
                toInt: true,
                isInt: true,
            },
            annuallyDiscount: {
                in: ["body"],
                optional: true,
                customSanitizer: {
                    options: (value, { req }) => {
                        if (value === "") return 0;
                        return value;
                    }
                },
                toInt: true,
                isInt: true,
            },
            dependencies: {
                in: ["body"],
                optional: true,
                isArray: true
            },
            'dependencies.*': {
                in: ["body"],
                custom: {
                    options: (value, { req }) => {
                        const Module = this.app.model('Module');

                        return Doc.resolve(value, Module).then(module => {
                            if (!module) {
                                return Promise.reject('Module not exist');
                            };
                        });
                    }
                },
                customSanitizer: {
                    options: (value, { req }) => {
                        const Module = this.app.model('Module');

                        return Doc.resolve(value, Module).then(result => {
                            if (result) return Promise.resolve(result);
                        });
                    }
                }
            },
            categories: {
                in: ["body"],
                optional: true,
                isArray: true
            },
            'categories.*': {
                in: ["body"],
                custom: {
                    options: (value, { req }) => {
                        const Category = this.app.model('Category');

                        return Doc.resolve(value, Category).then(category => {
                            if (!category) {
                                return Promise.reject('Category not exist');
                            };
                        });
                    }
                },
                customSanitizer: {
                    options: (value, { req }) => {
                        const Category = this.app.model('Category');

                        return Doc.resolve(value, Category).then(result => {
                            if (result) return Promise.resolve(result);
                        });
                    }
                }
            },
        }
    }
}

module.exports = CreateOrUpdateModuleValidator;