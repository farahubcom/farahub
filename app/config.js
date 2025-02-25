const config = {

    /**
     * The application hostname
     *
     * @var string
     */
    hostname: process.env.NODE_ENV === 'production' ? 'farahub.com' : 'farahub.local',

    /**
     * Determine if application is in development env
     * 
     * @var boolean
     */
    dev: process.env.NODE_ENV !== "production",

    /**
     * The application modules
     *
     * @var Module[]
     */
    modules: [
        require('@farahub/notifications'),
        require('@farahub/activities'),

        require('@farahub/permissions'),
        require('@farahub/roles'),

        // require('../modules/authentication/module'),
        // require('../modules/core/module'),
        // require('../modules/sms/module'),
        // require('../modules/subscription/module'),
        // require('../modules/categories/module'),
        // -- require('../modules/online-payment/module'),
        // require('../modules/storage/module'),

        // require('../modules/tickets/module'),
        // require('../modules/documentation/module'),
    ],

    /**
     * The application core modules names
     * 
     * @var string[]
     */
    coreModules: [
        'Permissions',
        'Roles',
        // 'Subscription',
        // 'Categories',
        // -- 'Online-Payment',
        // 'Core',
        // 'Storage',

        // // Authentication module with dependencies
        // 'Sms',
        // 'Authentication',
    ],

    /**
     * Default modules that used in all workspaces
     * 
     * @var string[]
     */
    defaultModules: [
        // 'Metas',
        // 'Notifications',
        // 'Activities',
    ],

    //
}

module.exports = config;
