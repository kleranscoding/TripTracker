const mongoose = require('mongoose');

const SpendingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    note: {
        type: String,
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
        type: String, 
        required: true,
    },
    location: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Location',
    },
    
});

const Spending = mongoose.model('Spending', SpendingSchema);

module.exports = Spending;
