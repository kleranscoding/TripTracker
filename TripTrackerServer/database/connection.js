const mongoose = require('mongoose');

mongoose.Promise = Promise;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/triptracker')
.then(connection => {
    //console.log(connection)
})
.catch(err => {
    console.log(err)
});

module.exports = mongoose;
