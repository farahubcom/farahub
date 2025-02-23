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
        //
    ],

    /**
     * The application core modules names
     * 
     * @var string[]
     */
    coreModules: [
        //
    ],

    /**
     * Default modules that used in all workspaces
     * 
     * @var string[]
     */
    defaultModules: [
        //
    ]

    //
}

module.exports = config;
