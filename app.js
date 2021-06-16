//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY); //tapping into api_key in .env file

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});


const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});


//dodatna funkcija za schemu enkriptira podatke. Da plugin ne bi kriptao cijelu schemu stavlja se encryptedFields i unutar zagrada specificiramo koji dio kriptat.
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]}); //mora ic prije mongoose.modela
//secret je kao ključ pomoću kojeg kriptiramo nase podatke u pluginu(šalje se kao objekt)
const User = new mongoose.model("User",userSchema);

app.get("/", function(req,res){
  res.render("home");
});

app.get("/login", function(req,res){
  res.render("login");
});

app.get("/register", function(req,res){
  res.render("register");
});

app.post("/register", function(req,res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save(function(err){   //mongoose-encrypt će automatski kriptati sifru kad se spremi
    if(err){
      console.log(err);
    }else {
      res.render("secrets");
    }
  });
});

app.post("/login", function(req,res){
  const username = req.body.username;
  const password = req.body.password;
  //mongoose-encrypt će automatski dekriptati sifru(pokazati) kad se zove findOne
  User.findOne({email: username}, function(err, foundUser){ //provjerava je li username(ono što je korisnik unio) imamo u bazi podataka === email(crveni)
    if(err){
      console.log(err);
    }else {
      if(foundUser){  //ako je korisnik pronađen u bazi
        if(foundUser.password === password) { //provjerava se je li sifra koju je korisnik unio password jednaka === foundUser.password (šifri u bazi)
          res.render("secrets");
        }
      }
    }
  });
});

app.listen(3000, function(){
  console.log("Server started on port 3000!");
});
