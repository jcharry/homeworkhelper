var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var message = new Schema({
    submit_date: Date,
    studentId: String,
    tutorId: String,
    message: String,
    requestId: String
});

module.exports = mongoose.model('Message', message);
