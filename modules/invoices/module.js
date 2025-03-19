const { Module } = require('@farahub/framework/foundation');
const models = require('./models');
const schemas = require('./schemas');
const controllers = require('./controllers');
const hooks = require('./hooks');
const roles = require('./roles');
const permissions = require('./permissions');


class InvoicesModule extends Module {

    /**
     * The module name
     * 
     * @var string
     */
    name = 'Invoices';

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
     * The module hooks
     * 
     * @var object
     */
    hooks = hooks;

    /**
     * The module roles
     * 
     * @var Object
     */
    roles = roles;

    /**
     * The module permissions
     * 
     * @var Object
     */
    permissions = permissions;

    /**
     * The module dependencies
     * 
     * @var array
     */
    dependencies = [
        'People',
        'Roles',
        'Products-Labels', // To add quick access label
        'Services',
        'Labels',
        'Pricing',
    ];

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

module.exports = InvoicesModule;