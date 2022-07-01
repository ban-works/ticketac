var express = require("express");
var router = express.Router();
var JourneyModel = require('../models/journey.js');
const mongoose = require("mongoose");
const { request } = require("express");

// useNewUrlParser ;)
var options = {
  connectTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// --------------------- BDD -----------------------------------------------------
mongoose.connect(
  "mongodb+srv://admin:OltDHFA1pzFdjFbN@cluster0.oqvza2f.mongodb.net/ticketac?retryWrites=true&w=majority",
  options,
  function (err) {
    if (err) {
      console.log(
        `error, failed to connect to the database because --> ${err}`
      );
    } else {
      console.info("*** Database Ticketac connection : Success ***");
    }
  }
);

var journeySchema = mongoose.Schema({
  departure: String,
  arrival: String,
  date: Date,
  departureTime: String,
  price: Number,
});

var journeyModel = mongoose.model("journey", journeySchema);

var city = [
  "Paris",
  "Marseille",
  "Nantes",
  "Lyon",
  "Rennes",
  "Melun",
  "Bordeaux",
  "Lille",
];
var date = [
  "2018-11-20",
  "2018-11-21",
  "2018-11-22",
  "2018-11-23",
  "2018-11-24",
];

// get login page
router.get("/login", function (req, res, next) {
  var errorMsg = ""
  res.render("index",{errorMsg});
});
// get login page for LOGOUT
router.get("/logout", function (req, res, next) {
  var errorMsg = "You are logged out"
  req.session.user = null
  console.log(req.session.user)
  res.render("index",{errorMsg});
});

/* GET home page. */
router.get("/", function (req, res, next) {
  var success = false
  res.render("booking",{success});
});
// GET booking
router.get("/booking", function (req, res, next) {
  var success = false
  res.render("booking",{success});
});
// GET results
router.post("/results", async function (req, res, next) {
  var departure = req.body.departure.toLowerCase();
  departure = departure.charAt(0).toUpperCase() + departure.slice(1);
  var arrival = req.body.arrival.toLowerCase();
  arrival = arrival.charAt(0).toUpperCase() + arrival.slice(1);
  var date = req.body.date;
  journeys = await JourneyModel.find({ departure: departure, arrival: arrival, date: date});
  if(journeys.length<1){
    res.redirect('/not-found')
  }else{
    res.render("results", {journeys});
  }
});

router.get("/not-found", function (req, res, next) {
  res.render("not-found", );
});

router.get("/my-tickets", function (req, res, next) {
  
  //check if user is logged in for front conditions
  var userEmpty = true;
  if(req.session.user != undefined){
    userEmpty = false;
  }
  // check if the query is empty and returns boolean
  var queryNotEmpty = true;
  if (req.query.departure == undefined){
    queryNotEmpty = false;
  }
  // if query not empty and tickets in session  empty, create tickets and push
  if(!req.session.tickets && queryNotEmpty){
    req.session.tickets =[]
    req.session.tickets.push(
      {
        departure : req.query.departure,
        arrival : req.query.arrival,
        date : req.query.date,
        departureTime : req.query.time,
        price :req.query.price,
      }
    )
   // push only si tickets in session not empty
  }else if (queryNotEmpty){
    req.session.tickets.push(
      {
        departure : req.query.departure,
        arrival : req.query.arrival,
        date : req.query.date,
        departureTime : req.query.time,
        price :req.query.price,
      }
    )
  }
  
  var tickets = req.session.tickets
    
  
  res.render("my-tickets", {tickets, userEmpty, success: false});
});



// Remplissage de la base de donnée, une fois suffit
router.get("/save", async function (req, res, next) {
  // How many journeys we want
  var count = 300;

  // Save  ---------------------------------------------------
  for (var i = 0; i < count; i++) {
    departureCity = city[Math.floor(Math.random() * Math.floor(city.length))];
    arrivalCity = city[Math.floor(Math.random() * Math.floor(city.length))];

    if (departureCity != arrivalCity) {
      var newUser = new journeyModel({
        departure: departureCity,
        arrival: arrivalCity,
        date: date[Math.floor(Math.random() * Math.floor(date.length))],
        departureTime: Math.floor(Math.random() * Math.floor(23)) + ":00",
        price: Math.floor(Math.random() * Math.floor(125)) + 25,
      });

      await newUser.save();
    }
  }
  res.render("index", { title: "Express" });
});

// Cette route est juste une verification du Save.
// Vous pouvez choisir de la garder ou la supprimer.
// router.get("/result", function (req, res, next) {
//   // Permet de savoir combien de trajets il y a par ville en base
//   for (i = 0; i < city.length; i++) {
//     journeyModel.find(
//       { departure: city[i] }, //filtre

//       function (err, journey) {
//         console.log(
//           `Nombre de trajets au départ de ${journey[0].departure} : `,
//           journey.length
//         );
//       }
//     );
//   }

//   res.render("index");
// });

module.exports = router;
