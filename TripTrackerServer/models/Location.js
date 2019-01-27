const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
    },
    startDate: {
        type: String,
        required: true,
    },
    endDate: {
        type: String,
        required: true,
    },
    trip: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Trip',
    }
});

const Location = mongoose.model('Location',LocationSchema);

module.exports = Location;
