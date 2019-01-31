const routes = require('express').Router();
const user = require('../controllers/userController');
const trip = require('../controllers/tripController');
const location = require('../controllers/locationController');
const spending = require('../controllers/spendingController');

routes.get('/', (request,response)=>{
    response.header('x-token','abcdefg')
    response.json({
        "success": true,
        "message": "welcome to void"
    });
});


routes.use('/api/users',user);

routes.use('/api/trips',trip);

routes.use('/api/locations',location);

routes.use('/api/spendings',spending);


module.exports = routes;