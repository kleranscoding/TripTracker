const mongoose = require('mongoose');

const SpendingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    location: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true,
    },
    currency: {
        type: String,
    },
    amount: {
        type: Number,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'Category',
    },
    trip: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'Trip',
    }
});

const Spending = mongoose.model('Spending', SpendingSchema);

module.exports = Spending;
