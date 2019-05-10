
const stateController = require('./controllers/state-controller');
const configController = require('./controllers/config-controller');
const testController = require('./controllers/test-controller');

const partials = {
    HOME: 'partials/home'
}

module.exports = app => {
    app.get('/', function (req, res) {
        res.render(partials.HOME);
        //res.send('Hello!');
    });
    app.post('/channel', stateController.post.createChannel);
    app.post('/buy', stateController.post.buyProduct);
    app.post('/stop', stateController.post.stopChannel);
    app.get('/config/params', configController.get.getParams);
    app.get('/products', configController.get.getProducts);
    app.get('/faucet', stateController.get.faucet);
    app.get('/test', testController.test)
}