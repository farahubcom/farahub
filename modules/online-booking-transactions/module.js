const { Module } = require('@farahub/framework/foundation');
const models = require('./models');
const schemas = require('./schemas');
const hooks = require('./hooks');
const controllers = require('./controllers');


class OnlineBookingTransactionsModule extends Module {

    /**
     * The module name
     * 
     * @var string
     */
    name = 'Online-Booking-Transactions';

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
        'Online-Booking',
        'Transactions',
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
}

module.exports = OnlineBookingTransactionsModule;