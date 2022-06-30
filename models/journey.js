var mongoose = require("mongoose");
var journeySchema = mongoose.Schema({
    departure : String,
    arrival : String,
    date : Date,
    departureTime : String,
    price:  Number,

});

var JourneyModel = mongoose.model('journeys', journeySchema);

module.exports = JourneyModel;