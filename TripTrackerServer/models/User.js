const mongoose = require('mongoose');

const User = mongoose.model('User',new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    city: {
        type: String,
    },
    image: {
        type: String
    }
}));

module.exports = User;