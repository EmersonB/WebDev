// #!/usr/bin/nodejs
// ABOVE LINE FOR TJ SERVER

var express = require('express');
var path = require('path')
var app = express();
var Handlebars = require('handlebars');
var cheerio = require('cheerio');


var admin = require("firebase-admin");

var serviceAccount = require(__dirname+"/private.json");

var firebase = require('firebase/app');
require('firebase/database');

var config = {
    apiKey: "--ZfxxA",
    authDomain: "-.firbaseapp.com",
    databaseURL: "://-.firebaseio.com",
    projectId: "-",
    storageBucket: "-.appspot.com",
    messagingSenderId: ""
  };


firebase.initializeApp(config);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tjweb-55683.firebaseio.com"
});
var db = admin.database();
var ref = db.ref("nodeapp");

//we're loading in our 'controllers' as middleware
app.use(require('./controllers'));

app.set('port', process.env.PORT || 8080);

var listener = app.listen(app.get('port'), function() {
  console.log( listener.address().port );
});

var count = 0;
  ref.child("counter").on("value", function(snapshot) {
  console.log(snapshot.val());
  count = parseInt(snapshot.val());
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});

app.get('/', function(req, res) {

  count+=1;
  var usersRef = ref.child("counter");
  usersRef.set(count);
  var return_string = 'Hello, the user count is currently \n' + count;
  var test_string = '<!DOCTYPE html>'+
'<html lang="en">'+
'  <head>'+
'    <meta charset="utf-8">'+
'    <meta name="viewport" content="width=device-width, initial-scale=1">'+
'    <title>Emoji Game</title>'+
''+
''+
'    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.0/jquery.min.js"></script>'+
''+
''+
'  </head>'+
'<body class="text-center">'+
'      <center>'+
'      <a id="feeling">How are you feeling?</a> </br>'+
'      <button onclick="moneyPressed()" id="money"> 🤑 </button>'+
'      <button onclick="sickPressed()" id="sick"> 🤒 </button>'+
'    </center>'+
'</body>'+
''+
'<script type = "text/javascript">'+
''+
'function enterPressed(e) {'+
'    if (e.keyCode == 13) {'+
'        submitPressed();'+
'    }'+
'}'+
'function moneyPressed() {'+
'  $(\'#feeling\').html("Rich!");'+
'}'+
'function sickPressed(){'+
'  $(\'#feeling\').html("Sick!");'+
'}'+
''+
''+
'</script>'+
'</html>';

  var source = "<p>Hello! This is your {{visit}} visit. This page is currently using handlebars. ";
  var template = Handlebars.compile(source);

  var data = { "visit": count};
  var result = template(data);
  console.log(result);
  //res.send('Hello there peoples @\n' + req.connection.remoteAddress);
  //res.send(return_string+test_string);
  res.send(result);
  //res.sendFile('index.html', {root: __dirname });
});
