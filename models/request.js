var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var request = new Schema({
    subject: String,
    description: String,
    bid: Number,
    poster: String,
    responders: {type: [String], default: []},
    hasResponder: Boolean,
    status: {type: String, default: "open"},
    chosenResponder: {
        username: String,
        id: String
    },
    open: {type: Boolean, default: true},
    submit_date: Date,
    shouldShowChosenResponder: {type: Boolean, default: false}
});

module.exports = mongoose.model('Request', request);
