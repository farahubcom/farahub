const { Seeder } = require("@farahub/framework/foundation");

class DatabaseSeeder extends Seeder {

    /**
     * Seeders to run
     * 
     * @var array
     */
    seeders = [
        require('./RolesSeeder'),
        require('./AdminWorkspaceSeeder'),
    ];

    /**
     * Run the seeder
     * 
     */
    async run() {
        for (const Seeder of this.seeders)
            await (new Seeder(this.app)).run();
        process.exit();
    }
}

module.exports = DatabaseSeeder;