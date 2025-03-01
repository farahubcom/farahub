module.exports = {

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
        require('@farahub/activities'),
        require('@farahub/authentication'),
        require('@farahub/categories'),
        require('@farahub/notifications'),
        require('@farahub/permissions'),
        require('@farahub/roles'),
        require('@farahub/sms'),
        require('@farahub/subscription'),
        // -- require('../modules/online-payment/module'),
        // require('../modules/storage/module'),
        
        // require('../modules/tickets/module'),
        // require('../modules/documentation/module'),
        
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
        // 'Storage',

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