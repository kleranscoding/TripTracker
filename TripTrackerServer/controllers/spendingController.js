const SALT_FACTOR= 10;
const BAD_REQ = 400;
const UNAUTH = 401;
const FORBIDDEN = 403;
const NOTFOUND = 404;
const CONFLICT = 409;
const INTERNAL_ERR = 500;

const EXPIRE= "12h";
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



// create new expenditure
router.post('/new',(req,res)=>{
    if (req.headers.authorization===undefined) {
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

    let newSpending = {
        "name": req.body.name,
        "amount": req.body.amount, 
        "currency": req.body.currency,
        "date": req.body.date,
        "category": req.body.category,
        "location": req.body.locId,
        "note": req.body.note,
    };
    db.Spending.create(newSpending).then(spend=>{
        if (!spend) {
            return res.status(INTERNAL_ERR).json({"success": false, "message": "db error"});
        }
        return res.json({
            "id": spend._id, "name": spend.name, 
            "date": spend.date, "currency": spend.currency,
            "amount": spend.amount, "category": spend.category,
            "note": spend.note, "location": spend.location,
        });
    });
});


module.exports = router;