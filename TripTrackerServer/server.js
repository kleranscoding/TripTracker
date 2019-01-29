const PORTNUM = 8001;
const express = require('express');
const parser = require('body-parser');
const cors = require('cors');

const passport = require('./config/passport')();
const routes = require('./routes');
const user = require('./controllers/userController');

const app = express();

app.use(cors());
app.use(parser.json());
app.use(passport.initialize());

app.use(express.static(__dirname + '/public'));

/*
app.get('/',(request,response)=>{
    response.json({
        "success": true,
        "message": "welcome to void"
    });
});

app.use('/api/users',user);
//*/

app.use('/',routes);

app.listen(process.env.PORT || PORTNUM);