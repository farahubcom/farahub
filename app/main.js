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
require('./app');