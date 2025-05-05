const { Module } = require('@farahub/framework/foundation');
const models = require('./models');
const schemas = require('./schemas');
const controllers = require('./controllers');
const roles = require('./roles');


class BeautySalonModule extends Module {

    /**
     * The module name
     * 
     * @var string
     */
    name = 'Beauty-Salon';

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
     * The module roles
     * 
     * @var Object
     */
    roles = roles;

    /**
     * The module dependencies
     * 
     * @var array
     */
    dependencies = [
        'People',
        'Roles'
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

module.exports = BeautySalonModule;