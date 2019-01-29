const routes = require('express').Router();
const user = require('../controllers/userController');
const trip = require('../controllers/tripController');

routes.get('/', (request,response)=>{
    response.header('x-token','abcdefg')
    response.json({
        "success": true,
        "message": "welcome to void"
    });
});

routes.use('/api/users',user);

routes.use('/api/trips',trip);


module.exports = routes;