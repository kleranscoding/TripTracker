require('../database/connection');
const mongoose = require('mongoose');
const db = require('../models')
const users = require('./users');


db.User.remove({})
.then(_=>{
    db.User.collection.insert(users)
    .then(seeded=>{
        console.log(seeded)
    });
});