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

        require('../modules/permissions/module'),
        require('../modules/roles/module'),
        require('../modules/authentication/module'),
        require('../modules/metas/module'),
        require('../modules/core/module'),
        require('../modules/sms/module'),
        require('../modules/subscription/module'),
        require('../modules/categories/module'),
        require('../modules/online-payment/module'),
        require('../modules/invite/module'),
        require('../modules/share/module'),
        require('../modules/notifications/module'),
        require('../modules/activities/module'),
        require('../modules/storage/module'),
        require('../modules/tickets/module'),
        require('../modules/people/module'),
        require('../modules/products/module'),
        // require('../modules/invoices/module'),
        // require('../modules/transactions/module'),
        // require('../modules/personal-accounting/module'),
        require('../modules/messages/module'),
        require('../modules/broadcast/module'),
        require('../modules/showcase/module'),
        require('../modules/digital-menu/module'),
        // require('../modules/contract/module'),
        // require('../modules/blog/module'),
        require('../modules/documentations/module'),
        // require('../modules/events/module'),
        require('../modules/tasks/module'),
        // require('../modules/todos/module'),
        require('../modules/iranserver-cloud/module'),
        require('../modules/automation/module'),
        require('../modules/customers-club/module'),
        require('../modules/customers-club-management/module'),
        require('../modules/online-shop/module'),
        require('../modules/gym-management/module'),
        require('../modules/backup/module'),
        require('../modules/crm/module'),
        require('../modules/pricing/module'),
        require('../modules/zarinpal/module'),
        require('../modules/discount/module'),
        require('../modules/coupon/module'),
        require('../modules/measurement/module'),
        require('../modules/currency/module'),

        // ceremonies
        // require('../modules/ceremonies/reservation/module'),
        // require('../modules/ceremonies/consignment/module'),
        // require('../modules/ceremonies/shipment/module'),

        // lawyers
        // require('../modules/lawyers/case-management/module'),

        // website builder
        // must be last item for routing priorties 
        require('../modules/website-builder/module'),

        require('../modules/arvan-cloud-storage/module'),
    ],

    /**
     * The application core modules names
     * 
     * @var string[]
     */
    coreModules: [

        // Core module with dependencies
        'Permissions',
        'Roles',
        'Subscription',
        'Categories',
        'Online-Payment',
        'Core',
        'IranServer-Cloud',
        'Storage',

        // Authentication module with dependencies
        'Sms',
        'Authentication',
    ],

    /**
     * Default modules that used in all workspaces
     * 
     * @var string[]
     */
    defaultModules: [
        'Metas',
        'Notifications',
        'Activities',
    ]

    //
}

module.exports = config;
