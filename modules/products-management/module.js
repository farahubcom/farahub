const { Module } = require('@farahub/framework/foundation');
const models = require('./models');
const schemas = require('./schemas');
const controllers = require('./controllers');
const permissions = require('./permissions');
const hooks = require('./hooks');


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
     * The module hooks
     * 
     * @var object
     */
    hooks = hooks;

    /**
     * The module permissions
     * 
     * @var Object
     */
    permissions = permissions;

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
}

module.exports = ProductsManagementModule;