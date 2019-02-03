const SALT_FACTOR= 10;
const BAD_REQ = 400;
const UNAUTH = 401;
const FORBIDDEN = 403;
const NOTFOUND = 404;
const CONFLICT = 409;
const INTERNAL_ERR = 500;

const EXPIRE= "12h";
const defaultImg = "images/default_trip.jpg";
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

// get trip details
router.get('/:id',(req,res)=>{
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

    db.Trip.findById(req.params.id).then(trip=>{
        if (!trip) {
            return res.status(NOTFOUND).json({"success": false, "message": "trip not found"});
        } else {
            console.log(trip.traveler.toString(),decodedToken.id)
            // check if same owner
            if (trip.traveler.toString()!==decodedToken.id) {
                return res.status(UNAUTH).json({"success": false, "message": "unauthorized action"});
            }
            db.Location.find({"trip": trip._id}).then(locations=>{
                let locArr= [];
                if (locations) {
                    locations.map(loc=>{
                        return locArr.push({
                            "id": loc._id, "location": loc.location, 
                            "startDate": loc.startDate, "endDate": loc.endDate,
                            "formateAddress": req.body.formatAddress,
                            "geocode": loc.geocode, "image": loc.image,
                        });
                    });
                } 
                return res.json({ 
                    "id": trip._id, "title": trip.title,
                    "startDate": trip.startDate, "endDate": trip.endDate,
                    "isFav": trip.isFav, "image": trip.image,
                    "locations": locArr,
                }); 
            });
        }
    });
});


// create new trip
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

    let newTrip = {
        "title": req.body.title,
        "startDate": req.body.startDate, "endDate": req.body.endDate,
        "traveler": decodedToken.id,
        "isFav": false, "image": defaultImg,
    };
    db.Trip.create(newTrip).then(trip=>{
        if (!trip) {
            return res.status(INTERNAL_ERR).json({"success": false, "message": "db error"});
        }
        return res.json({
            "id": trip._id, "title": trip.title, 
            "startDate": trip.startDate, "endDate": trip.endDate,
            "isFav": trip.isFav, "image": trip.image,
        });
    });
});


// edit trip
router.put('/edit/:id',(req,res)=>{
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

    db.Trip.findById(req.params.id).then(trip=>{
        if (!trip) {
            return res.status(NOTFOUND).json({"success": false, "message": "trip not found"});
        }
        if (trip.traveler.toString()!==decodedToken.id) {
            return res.status(UNAUTH).json({"success": false, "message": "unauthorized action"});
        } else {
            db.Trip.findByIdAndUpdate(req.params.id,{$set: req.body},{new: true},function(err,editedObj){
                if (err) {
                    return res.status(INTERNAL_ERR).json({"success": false, "message": "db error"});
                } else {
                    if (!editedObj) {
                        return res.status(INTERNAL_ERR).json({"success": false, "message": "trip not found"});
                    }
                    return res.json({
                        "id": editedObj.id,
                        "title": editedObj.title, "startDate": editedObj.startDate, "endDate": editedObj.endDate,
                        "isFav": editedObj.isFav, "image": editedObj.image, 
                    });
                }
            });
            
        }
    })
});

// delete trip by id
router.delete('/delete/:id',(req,res)=>{
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

    console.log(req.params.id)
    db.Trip.findById(req.params.id).then(trip=>{
        if (!trip) {
            return res.status(NOTFOUND).json({"success": false, "message": "trip not found"});
        } else {
            console.log(trip.traveler.toString(),decodedToken.id)
            // check if same owner
            if (trip.traveler.toString()!==decodedToken.id) {
                return res.status(UNAUTH).json({"success": false, "message": "unauthorized action"});
            }
            db.Trip.findByIdAndRemove(req.params.id).then(deletedTrip=>{
                if (!deletedTrip) {
                    return res.status(NOTFOUND).json({"success": false, "message": "cannot delete trip"});
                } else {
                    let removedTrip = {
                        "id": deletedTrip.id, "title": deletedTrip.title, 
                        "startDate": deletedTrip.startDate, "endDate": deletedTrip.endDate,
                        "isFav": deletedTrip.isFav, "image": deletedTrip.image,
                    };
                    return res.json(removedTrip);
                }
            });
        }
    });
    
    //return res.status(INTERNAL_ERR).json({"success": false, "message": "under construction"});
});

module.exports = router;