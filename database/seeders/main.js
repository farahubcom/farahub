const DatabaseSeeder = require('./DatabaseSeeder');

/**
 * Register environment variables
 */
require('dotenv').config();

/**
 * Register module alias
 */
require('module-alias/register');


/**
 * Make the application
 */
const app = require('../../app/app');


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

