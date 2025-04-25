const path = require('path');

module.exports = {

    /**
     * The application hostname
     *
     * @var string
     */
    hostname: process.env.HOST_NAME || 'farahub.local',

    /**
     * The application http port
     *
     * @var number
     */
    portHttp: process.env.PORT_HTTP || 8000,

    /**
     * Determine if application is in development env
     * 
     * @var boolean
     */
    dev: process.env.NODE_ENV !== "production",

    /**
     * Name of the application core database
     * 
     * @var string
     */
    coreDbName: process.env.CORE_DB_NAME || 'farahub_core',

    /**
     * All the modules used within the application include their deps
     * TODO: should resolve and add modules deps automatily later
     *
     * @var Module[]
     */
    modules: [
        // Core modules
        require('@farahub/activities'),
        require('@farahub/authentication'),
        require('@farahub/categories'),
        require('@farahub/notifications'),
        require('@farahub/permissions'),
        require('@farahub/roles'),
        require('@farahub/sms'),
        require('@farahub/subscription'),
        // -- require('../modules/online-payment/module'),
        require('@farahub/storage'),


        // Support modules
        // require('../modules/tickets/module'),
        // require('../modules/documentation/module'),


        // Workspaces modules
        require('@farahub/people'),
        require('@farahub/products'),
        require('@farahub/pricing'),
        // require('@farahub/invoices'),
        require('@farahub/transactions'),


        // Bundles
        // require('@farahub/customers-club'),
        // require('@farahub/customers-club-management'),

        // App modules (should be package later)
        require('../modules/customers/module'),
        require('../modules/employees/module'),
        require('../modules/labels/module'),
        require('../modules/roles-management/module'),
        require('../modules/services/module'),
        require('../modules/products-labels/module'),
        require('../modules/invoices/module'),
        require('../modules/invoices-commissions/module'),
        require('../modules/invoices-transactions/module'),
        require('../modules/accounting-accounts/module'),
        require('../modules/accounting-documents/module'),
        require('../modules/accounting/module'),
        require('../modules/online-booking/module'),
        require('../modules/online-booking-transactions/module'),
        require('../modules/beauty-salon/module'),
        require('../modules/products-management/module'),

        // App module
        require('../app/module'),
    ],

    /**
     * The application core modules names
     * 
     * @var string[]
     */
    coreModules: [
        'Permissions',
        'Roles',
        'Subscription',
        'Categories',
        // -- 'Online-Payment',

        'Core',
        'Storage',

        'Sms',
        'Authentication',
    ],

    /**
     * Default modules that used in all workspaces
     * 
     * @var string[]
     */
    defaultModules: [
        'Notifications',
        'Activities',
    ],

    /**
     * resolve application root path
     *
     * @var string
     */
    rootPath: path.join(__dirname, '..'),

    /**
     * resolve application path
     *
     * @var string
     */
    appsPath: path.join(__dirname, '../apps'),
}