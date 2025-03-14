const { Module } = require('@farahub/framework/foundation');
const models = require('./models');
const schemas = require('./schemas');
const controllers = require('./controllers');
const listeners = require('./listeners');


class ProductsManagementModule extends Module {

    /**
     * The module name
     * 
     * @var string
     */
    name = 'Products-Management';

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
        'Products',
    ];

    /**
     * Register the module
     * 
     * @return void
     */
    register() {
        this.registerModels(models);
        this.registerSchemas(schemas);
        this.registerListeners(listeners);
        this.registerControllers(controllers);
    }
}

module.exports = ProductsManagementModule;