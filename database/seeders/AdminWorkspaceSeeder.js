const { Seeder } = require('@farahub/framework/foundation');
const { Doc } = require('@farahub/framework/facades');
const fs = require('fs');
const path = require('path');
const { hash } = require('bcrypt');


class AdminWorkspaceSeeder extends Seeder {

    /**
     * Create module subscription for the workspace
     * 
     * @param {*} workspace workspace
     * @param {Module} moduleDoc module
     */
    async _createWorkspaceSubscription(workspace, moduleDoc) {
        const hereditaries = await moduleDoc.getHereditary();

        const wsModules = await workspace.resolveModulesHereditary(this.app);

        await Promise.all(
            hereditaries.map(
                async hereditary => {
                    const workspaceHasModule = wsModules.filter(m => String(m.name).toLowerCase() === hereditary.identifier).length > 0;
                    if (!workspaceHasModule) {
                        await workspace.subscribeTo(
                            hereditary,
                            'Module',
                            new Date()
                        );
                    }
                }
            )
        )
    }

    /**
     * Run the seeder
     * 
     */
    async run() {

        try {
            const JSONData = fs.readFileSync(
                path.join(__dirname, '../data/admin_workspace.json'),
                'utf-8'
            )

            const data = JSON.parse(JSONData);

            const Workspace = this.app.connection.model('Workspace');

            // create admin workspace
            const adminWorkspace = await Workspace.createNew(data.workspace);

            // add modules to the workspace
            if (data.modules?.length) {
                const Module = this.app.connection.model('Module');

                for (const moduleId of data.modules) {
                    const moduleDoc = await Doc.resolveByIdentifier(moduleId, Module);
                    await this._createWorkspaceSubscription(adminWorkspace, moduleDoc);
                }
            }

            // add users as admin to the workspace
            await Promise.all(
                data.members.map(
                    async (member) => {

                        const User = this.app.connection.model('User');

                        const user = await User.createNew({ ...member });

                        // add admin user to workspace as owner
                        const Role = this.app.connection.model('Role');
                        let role = await Doc.resolveByIdentifier('owner', Role);

                        if (!role) {
                            role = await Role.createNew
                        }

                        const password = await hash('admin', 10);

                        await adminWorkspace.addMember(user, role, {
                            password,
                            tabBarPins: [],
                            options: {
                                showWalkthrough: false
                            }
                        });

                        // set workspace as user current
                        await user.setCurrentWorkspace(adminWorkspace);
                    }
                )
            )

            // TEST ONLY
            // add automations tasks to the workspace
            // const connection = await adminWorkspace.createConnection(app);
            // const Task = connection.model('AutomationTask');
            // await Promise.all(
            //     data.automations.map(
            //         async (_task) => await Task.create({ ..._task, createdAt: new Date() })
            //     )
            // )

            console.log('Farahub admin data seeded...');

        } catch (error) {
            throw error;
        }
    }
}

module.exports = AdminWorkspaceSeeder;