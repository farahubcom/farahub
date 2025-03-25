const View = require('@farahub/framework/facades/View');
const { Controller } = require('@farahub/framework/foundation');

class MainController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Main';

    /**
     * The controller routes
     * 
     * @var array
     */
    routes = [
        {
            type: 'web',
            method: 'get',
            path: '/',
            handler: 'home',
        },
    ];

    /**
     * Display home page
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    home() {
        return [
            View.setRenderBasePath(this.app.getAppsPath('test', 'views')),
            async function (req, res) {
                return res.render('index', { id: 'Nila Crm' });
                // return res.json(req.workspace?.identifier);
                // return res.resolveAndRender(req.path);
            }
        ]
    }
}

module.exports = MainController;