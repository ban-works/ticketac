var express = require('express');
const { updateOne } = require('../models/journey');
var router = express.Router();
var UserModel = require('../models/users');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//SIGN-UP
router.post('/sign-up', async function(req, res, next) {
  var users = await UserModel.find({email : req.body.email})
  var emailTaken = false;
  for (i=0; i<users.length; i++){
    if( req.body.email == users[i].email ){
      emailTaken = true;
    }
  };
  
  if (emailTaken == false){

  //Prep des données - nouvel utilisateur - en récup les données form
  var newUser = new UserModel ({
    firstName: req.body.firstname ,
    lastName: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
});
//enregistrement du nouvel utilisateur
console.log('inputs', newUser)
  var userSaved = await newUser.save();

  //création de la session utilisateur avec les infos database
  req.session.user = {
    email : userSaved.email,
    id : userSaved._id
  };

  console.log('sess', req.session.email)

  //on redirige vers la page météo
  res.redirect('/booking');
} else {
  res.redirect('/')
}
});

// SIGN-IN
router.post('/sign-in', async function(req, res, next) {

var userFind = await UserModel.findOne({email:req.body.email});
if(userFind){
  req.session.user = {
    email : userFind.email,
    id : userFind._id
  }

}

if(userFind!=null && req.body.password == userFind.password){ 

  res.redirect('/booking' );
} else {
  res.render('index');
};
});


// GET Confirm order - push session tickets into DB
router.get("/confirm", async function (req, res, next) {
  var ticketsEmpty = true;
  if(req.session.tickets != undefined){
    ticketsEmpty = false;
  }
  var userEmpty = true;
  if(req.session.user != undefined){
    userEmpty = false;
  }
  if (!ticketsEmpty && !userEmpty){
      tickets = req.session.tickets
      var user = await UserModel.findOne({ email: req.session.user.email });
      for (i=0;i<req.session.tickets.length;i++){
          user.pastTrips.push(req.session.tickets[i])
      };
      await user.save();
  }
  
  res.redirect("/my-tickets");
});

// GET Last trips based on user in DB
router.get("/last-trips", async function (req, res, next) {
  var user = await UserModel.findOne({ email: req.session.user.email});
  console.log(user)
  var lastTrips = user.pastTrips;
  console.log(lastTrips)
  res.render("last-trips",{lastTrips} );
});
module.exports = router;
