const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    title: {
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
    traveler: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
    }
});

const Trip = mongoose.model('Trip',TripSchema);

module.exports = Trip;