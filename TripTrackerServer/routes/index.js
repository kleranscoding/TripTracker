const routes = require('express').Router();
const user = require('../controllers/userController');

routes.get('/', (request,response)=>{
    response.header('x-token','abcdefg')
    response.json({
        "success": true,
        "message": "welcome to void"
    });
});

routes.use('/api/users',user);


module.exports = routes;