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
     * The application modules
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


        // Bundles
        require('@farahub/customers-club'),
        require('@farahub/customers-club-management'),


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
}