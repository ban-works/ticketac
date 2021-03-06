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

  res.redirect('/my-tickets');
} else {
  res.redirect('/')
}
});

// SIGN-IN
router.post('/sign-in', async function(req, res, next) {
// je cherche l'email dans la bdd
var userFind = await UserModel.findOne({email:req.body.email});
// je definis l'errormsg vide + les bollens a false
var errorMsg = '';
var isPasswordRight = false;
var isEmailRight = false;
// si ma bdd me renvoie un user
if(userFind != null){
// je passe l'email a true
  if (userFind.email == req.body.email){
    isEmailRight = true
  }
// si le password est OK je passe passzord a true
  if(userFind.password == req.body.password){
      isPasswordRight = true;
    }
  }
  // si l'email est inconnu en bdd
  if (!isEmailRight){
    // Affiche un message user does not exist
    errorMsg = 'Your email is invalid. Please signup !';
    res.render('index',{errorMsg});
  }
  // si l'email est connu en bdd mais le password est faux
  if (!isPasswordRight && isEmailRight){
    //Affiche un mesage password not ok
    errorMsg = 'Your password is incorrect, please try again!';
    res.render('index',{errorMsg});
  }
// si password et email sont true, alors je redirige vers my-tickets
  if (isPasswordRight && isEmailRight){
    req.session.user = {
      email : userFind.email,
      id : userFind._id
    }
    res.redirect('/my-tickets');
  }
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
  if(userEmpty){
    var errorMsg = 'Please log in to continue.'
    res.render("index",{errorMsg});
  }else{
    if (!ticketsEmpty){
      tickets = req.session.tickets
      var user = await UserModel.findOne({ email: req.session.user.email });
      for (i=0;i<req.session.tickets.length;i++){
          user.pastTrips.push(req.session.tickets[i])
      };
      await user.save();
      req.session.tickets = null
  }
  success=true
  res.render("booking",{success});
  }
  
  
});

// GET Last trips based on user in DB
router.get("/last-trips", async function (req, res, next) {
  
  if(req.session.user == undefined){
    var errorMsg = 'Please log in to continue.'
    res.render("index",{errorMsg});
  }else{
    var user = await UserModel.findOne({ email: req.session.user.email});
    console.log(user)
    var lastTrips = user.pastTrips;
    console.log(lastTrips)
    res.render("last-trips",{lastTrips} );
  }
  
});
module.exports = router;
