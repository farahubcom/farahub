const { Module } = require("@farahub/framework/foundation");
const models = require('./models');
const schemas = require('./schemas');
const controllers = require('./controllers');
const hooks = require('./hooks');


class InvoicesFactorsModule extends Module {

    /**
     * The module name
     * 
     * @var string
     */
    name = 'Invoices-Factors';

    /**
     * The module version
     * 
     * @var string
     */
    version = '1.0.0';

    /**
     * The module base path
     * 
     * use for routing 
     * 
     * @var string
     */
    basePath = '';

    /**
     * The module dependencies
     * 
     * @var array
     */
    dependencies = [
        'Invoices'
    ];

    /**
     * The module hooks
     * 
     * @var object
     */
    hooks = hooks;

    /**
     * Register the module
     * 
     * @return void
     */
    register() {
        this.registerModels(models);
        this.registerSchemas(schemas);
        this.registerControllers(controllers);
    }

    /**
     * Boot the module
     * 
     * @return void
     */
    boot() {
        //
    }
}

module.exports = InvoicesFactorsModule;