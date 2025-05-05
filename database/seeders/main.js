const DatabaseSeeder = require('./DatabaseSeeder');

/**
 * Register environment variables
 */
require('dotenv').config();


/**
 * Require Farahub app
 */
const { Application } = require('@farahub/framework/foundation');


/**
 * Get application configurations
 * 
 * @var Object
 */
const config = require('../../config');


/**
 * Create application instance
 * 
 * @var Application
 */
const app = new Application();


/**
 * Make the application
 */
app.make(config);


/**
 * Create database seeder instance
 * 
 * @var DatabaseSeeder
 */
const dbSeeder = new DatabaseSeeder(app);


/**
 * Run the seeder
 */
dbSeeder.run();

