const SALT_FACTOR= 10;
const BAD_REQ = 400;
const UNAUTH = 401;
const FORBIDDEN = 403;
const NOTFOUND = 404;
const CONFLICT = 409;
const INTERNAL_ERR = 500;

const EXPIRE= "12h";
const defaultImg = "images/default_profile.jpg";
const maxFileSize = 10*1024*1024;

require('../database/connection');
const db = require('../models');
const passport = require('../config/passport')
const config = require('../config/config')

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');

/* /////////////// HELPER FUNCTIONS /////////////// */

function padZero(num) { return (num>=0 && num<=9)? `0${num}`:`${num}`; }

function createTimeStamp(timeRequired) {
    let today = new Date();
    let timestamp = `${today.getFullYear()}-${padZero(today.getMonth()+1)}-${padZero(today.getDate())}`
    if (timeRequired) {
        //console.log(today.getHours(),today.getMinutes())
        timestamp = `${timestamp}T${padZero(today.getHours())}:${padZero(today.getMinutes())}:${padZero(today.getSeconds())}`
    }
    return timestamp;
}


function verifyToken(token) {
    let decoded = {};
    jwt.verify(token,config.jwtSecret,function(err,verified){
        if (err) {
            decoded= {"message": err.message };
        } else {
            decoded = verified;
        }
    })
    return decoded;
}

/* /////////////// ROUTES AND CONTROLLERS /////////////// */

// profile route
router.get('/profile',(req,res)=>{
    let auth = req.headers.authorization;
    if (auth===undefined || auth===null) {
        return res.status(FORBIDDEN).json({
            "success": false, "message": "forbidden"
        });
    }
    let userToken = req.headers.authorization.split(" ")[1];
    let decodedToken = verifyToken(userToken);
    
    if (decodedToken.id===undefined) {
        decodedToken["success"]= false;
        return res.status(UNAUTH).json(decodedToken);
    }

    db.User.findById(decodedToken.id).then(user=>{
        if (!user) {
            return res.status(UNAUTH).json({
                "success": false, "message": "user not found"
            });
        }
        // store user object
        let userObj = {
            "username": user.username,
            "email": user.email,
            "image": user.image,
        };
        db.Trip.find({"traveler": decodedToken.id}).then(trips=>{
            let userTrips = [];
            trips.map(trip=>{
                userTrips.push({
                    "id": trip._id, "title": trip.title,
                    "startDate": trip.startDate, "endDate": trip.endDate,
                    "isFav": trip.isFav, "image": trip.image,  
                });
            });
            userObj["trips"]= userTrips;
            return res.json(userObj);
        }).catch(err=>{
            console.log(err)
            return res.status(INTERNAL_ERR).json({
                "success": false, "message": "db error"
            });
        }); 
    });
})



// register route
router.post('/register',(req,res)=>{
    if (!(req.body.username && req.body.email && req.body.password)) {
        return res.status(BAD_REQ).json({
            "success": false, "message": "register data is empty"
        });
    }
    bcrypt.hash(req.body.password,SALT_FACTOR,(err,hash)=>{
        if (err) {
            return res.status(INTERNAL_ERR).json({
                "success": false, "message": "bad password"
            });
        }
        // create new user
        let newUser = {
            "username": req.body.username,
            "email": req.body.email,
            "password": hash,
            "city": "",
            "image": defaultImg,
        };
        // check if email exists in db
        db.User.findOne({email: req.body.email}).then(user=>{
            if (user) {
                return res.status(CONFLICT).json({
                    "success": false, "message": "email is taken"
                });
            }
            db.User.create(newUser).then(user=>{
                if (user) {
                    let token = jwt.sign({id: user.id},config.jwtSecret,{
                        expiresIn: EXPIRE,
                    })
                    res.header('x-token',token);
                    return res.json({"success": true, "message": "user created"});
                } else {
                    return res.status(NOTFOUND).json({
                        "success": false, "message": "bad token"
                    });
                }
            });
        });
    });
});


// get favorites
router.get('/favorite',(req,res)=>{
    let auth = req.headers.authorization;
    if (auth===undefined || auth===null) {
        return res.status(FORBIDDEN).json({
            "success": false, "message": "forbidden"
        });
    }
    let userToken = req.headers.authorization.split(" ")[1];
    let decodedToken = verifyToken(userToken);

    if (decodedToken.id===undefined) {
        decodedToken["success"]= false;
        return res.status(UNAUTH).json(decodedToken);
    }
    
    db.User.findById(decodedToken.id).then(user=>{
        if (!user) {
            return res.status(UNAUTH).json({
                "success": false, "message": "user not found"
            });
        }
        db.Trip.find({"traveler": decodedToken.id, "isFav": true}).then(trips=>{
            let userTrips = [];
            trips.map(trip=>{
                userTrips.push({
                    "id": trip._id, "title": trip.title,
                    "startDate": trip.startDate, "endDate": trip.endDate,
                    "isFav": trip.isFav, "image": trip.image,  
                });
            });
            return res.json(userTrips);
        }).catch(err=>{
            console.log(err)
            return res.status(INTERNAL_ERR).json({
                "success": false, "message": "db error"
            });
        });
        
    }).catch(err=>{
        console.log("some error")
        console.log(err)
    });
});



// login route
router.post('/login',(req,res)=>{
    if (!(req.body.email && req.body.password)) {
        return res.status(BAD_REQ).json({
            "success": false, "message": "login data is empty"
        });
    }
    db.User.findOne({"email": req.body.email}).then(user=>{
        if (!user) {
            console.log("user not found")
            return res.status(NOTFOUND).json({
                "success": false, "message": "user not found"
            });
        }
        bcrypt.compare(req.body.password, user.password, (err,match)=>{
            if (err) {
                return res.status(INTERNAL_ERR).json({
                    "success": false, "message": "bad password"
                });
            }
            if (match) {
                let payload = { id: user.id };
                let token = jwt.sign(payload,config.jwtSecret,{
                    expiresIn:  EXPIRE
                });
                res.header('x-token',token);
                return res.json({"success": true, "message": "user found"});
            } else {
                return res.status(UNAUTH).json({
                    "success": false, "message": "incorrect email/password"
                });
            } 
        })
    }).catch(_=>{
        return res.status(INTERNAL_ERR).json({
            "success": false, "message": "database error"
        });
    });
    
});



router.get('/all',(req,res)=>{
    db.User.find().then(users=>{
        if (users) {
            var usernames= new Array()
            users.map(user=>{ return usernames.push(user.username)});
            res.header('x-token',users[0].username);
            return res.json({"success": true, "users": usernames});
        } else {
            return res.status(NOTFOUND).json({"success": false, "message": "user not found"});
        }
        
    }).catch(err=>{
        return res.status(INTERNAL_ERR).json({"success": false, "message": "database error"});
    });
});


module.exports = router;