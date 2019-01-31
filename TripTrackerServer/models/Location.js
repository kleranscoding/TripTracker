const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
    },
    startDate: {
        type: String,
    },
    endDate: {
        type: String,
    },
    formatAddress: {
        type: String,
    },
    geocode: {
        lat: { type: String, },
        lng: { type: String, },
    },
    trip: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Trip',
    },
    image: {
        type: String,
    },
});

const Location = mongoose.model('Location',LocationSchema);

module.exports = Location;
