const { Application } = require('farahub');


/**
 * Get application configurations
 * 
 * @var Object
 */
const config = require('./config');


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
 * Export the application
 */
module.exports = app;