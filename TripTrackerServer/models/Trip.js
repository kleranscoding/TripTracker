const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    startDate: {
        type: String,
    },
    endDate: { type: String, },
    traveler: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
    },
    isFav: { type: Boolean, },
    image: { type: String, },
});

const Trip = mongoose.model('Trip',TripSchema);

module.exports = Trip;