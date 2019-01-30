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
        lat: { type: Number, },
        lng: { type: Number, },
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
