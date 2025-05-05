const { Seeder } = require('@farahub/framework/foundation');
const fs = require('fs');
const path = require('path');


class RolesSeeder extends Seeder {

    /**
     * Run the seeder
     * 
     */
    async run() {
        try {
            const data = fs.readFileSync(
                path.join(__dirname, '../data/roles.json'),
                'utf-8'
            )
    
            const roles = JSON.parse(data);
    
            const Role = this.app.connection.model('Role');
    
            await Role.create(roles);
    
            console.log('All roles seeded...');
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RolesSeeder;