const SALT_FACTOR= 10;
const BAD_REQ = 400;
const UNAUTH = 401;
const FORBIDDEN = 403;
const NOTFOUND = 404;
const CONFLICT = 409;
const INTERNAL_ERR = 500;

const EXPIRE= "12h";
const defaultImg = "images/default_loc.jpg";
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


// get location details
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

    db.Location.findById(req.params.id).populate('trip').then(loc=>{
        if (!loc) {
            return res.status(NOTFOUND).json({"success": false, "message": "location not found"});
        } else {
            // check if same owner
            if (loc.trip.traveler.toString()!==decodedToken.id) {
                return res.status(UNAUTH).json({"success": false, "message": "unauthorized action"});
            }
            db.Spending.find({"location": loc._id}).then(spendings=>{
                let spendArr= [];
                if (spendings) {
                    spendings.map(spend=>{
                        return spendArr.push({
                            "id": spend._id, 
                            "date": spend.date, "name": spend.name, 
                            "amount": spend.amount, "currency": spend.currency,
                            "category": spend.category, "note": spend.note,
                        });
                    });
                } 
                return res.json({
                    "id": loc._id, "location": loc.location,
                    "startDate": loc.startDate, "endDate": loc.endDate,
                    "formatAddress": loc.formatAddress, "geocode": loc.geocode,
                    "image": loc.image, "spendings": spendArr,
                });
            });
        }
    });
});


// create new location
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

    db.Trip.findById(req.body.tripId).then(trip=>{
        if (!trip) {
            return res.status(NOTFOUND).json({"success": false, "message": "trip not found"});
        } else {
            // check if same owner
            if (trip.traveler.toString()!==decodedToken.id) {
                return res.status(UNAUTH).json({"success": false, "message": "unauthorized action"});
            }
            let newLoc = {
                "location": req.body.location, 
                "startDate": req.body.startDate, "endDate": req.body.endDate,
                "formatAddress": req.body.formatAddr,
                "geocode": {
                    "lat": req.body.geocode.lat, 
                    "lng": req.body.geocode.lng,
                },
                "trip": req.body.tripId,
                "image": defaultImg,
            };
            db.Location.create(newLoc).then(loc=>{
                if (!loc) {
                    return res.status(INTERNAL_ERR).json({"success": false, "message": "db error"});
                }
                return res.json({
                    "id": loc._id, "location": loc.location, 
                    "startDate": loc.startDate, "endDate": loc.endDate,
                    "formatAddress": req.body.formatAddress,
                    "geocode": loc.geocode, "image": loc.image,
                })
            });
        }
    });
});


// edit location
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

    db.Location.findById(req.params.id).populate('trip').then(loc=>{
        if (!loc) {
            return res.status(NOTFOUND).json({"success": false, "message": "location not found"});
        }
        if (loc.trip.traveler.toString()!==decodedToken.id) {
            return res.status(UNAUTH).json({"success": false, "message": "unauthorized action"});
        } else {
            db.Location.findByIdAndUpdate(req.params.id,{$set: req.body},{new: true},function(err,editedObj){
                if (err) {
                    return res.status(INTERNAL_ERR).json({"success": false, "message": "db error"});
                } else {
                    if (!editedObj) {
                        return res.status(INTERNAL_ERR).json({"success": false, "message": "location not found"});
                    }

                    return res.json({
                        "id": editedObj.id,
                        "location": editedObj.location, "startDate": editedObj.startDate, "endDate": editedObj.endDate,
                        "formatAddress": editedObj.formatAddress, "geocode": editedObj.geocode 
                    });
                }
            });
            
        }
    })
});


// delete location by id
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

    db.Location.findById(req.params.id).populate('trip').then(loc=>{
        if (!loc) {
            return res.status(NOTFOUND).json({"success": false, "message": "trip not found"});
        } else {
            //console.log(loc.trip.traveler.toString(),decodedToken.id,loc.trip.traveler.toString()===decodedToken.id)
            // check if same owner
            if (loc.trip.traveler.toString()!==decodedToken.id) {
                return res.status(UNAUTH).json({"success": false, "message": "unauthorized action"});
            }
            db.Location.findByIdAndRemove(req.params.id).then(deletedLoc=>{
                if (!deletedLoc) {
                    return res.status(NOTFOUND).json({"success": false, "message": "cannot delete trip"});
                } else {
                    let removedLoc = {
                        "id": deletedLoc.id, "location": deletedLoc.location, 
                        "startDate": deletedLoc.startDate, "endDate": deletedLoc.endDate,
                        "formatAddress": deletedLoc.formatAddress, "geocode": deletedLoc.geocode,
                        "image": deletedLoc.image,
                    };
                    return res.json(removedLoc);
                }
            });
        }
    });
    //return res.status(INTERNAL_ERR).json({"success": false, "message": "under construction"});
});

module.exports = router;