// #!/usr/bin/nodejs
// ABOVE LINE FOR TJ SERVER

var express = require('express');
var path = require('path')
var app = express();
var Handlebars = require('handlebars');
var cheerio = require('cheerio');
var fileUpload = require('express-fileupload');
var PythonShell = require('python-shell');
var bodyParser = require('body-parser');
var simpleoauth2 = require("simple-oauth2");
var sqlite3 = require('sqlite3').verbose();

exports.engine = 'hbs';


var ion_client_id = process.env.ION_CLIENT_ID;
var ion_client_secret = process.env.ION_CLIENT_SECRET;
var ion_redirect_uri = process.env.ION_REDIRECT_URI;

var oauth = simpleoauth2.create({
    client: {
        id: "GCth7IMxd0hEVwJ14bTh7d7VU5vOtPmqYpKWuXFp",
        secret: "XMpTxARzTJ9Xg2tDeitySHXZINJRYre3dOGwkJT4LtR5y7fL5dT3K2ohAg5LISzPpNROtrCKDS1FOb3VNKiwcRJnULAAjGGgVIKuLxKbCSCilkgkvSReVOgtgl7H3pMu"
    },
    auth: {
        tokenHost: 'https://ion.tjhsst.edu/oauth'
    }
});

var login_url = oauth.authorizationCode.authorizeURL({
    scope: "read", // remove scope: read if you also want write access
    redirect_uri: ion_redirect_uri
});

var db = new sqlite3.Database('test.db');

app.use(bodyParser.urlencoded());

app.use(fileUpload());

app.use(require('./controllers'));

app.set('port', process.env.PORT || 8080);

var listener = app.listen(app.get('port'), function() {
  console.log( listener.address().port );
});

app.get('/:file(*)', function (req,res,next){
  var file = req.params.file
  , path = __dirname + '/python/'+file;

  res.download(path);
});
//login_with_email_name('eberlik@gmail.com','Emerson');
app.get('/', function(req, res) {

  //res.sendFile('index.html', {root: __dirname });
  var template = require( __dirname+'/homelocal.hbs');
  var data = { "title": "NodeApp"};
  var result = template(data);
  res.send(result);

  // PythonShell.run('python/testscript.py', function (err) {
  //   if (err) throw err;
  //   console.log('finished');
  // });

});

app.post('/upload', function(req, res) {
  //console.log(req.files.sampleFile.name);
  console.log(user_status);
  if (!req.files.sampleFile){
    print(err)
    return res.status(400).send('No files were uploaded.');
  }

  if(!user_status){
    return res.status(400).send('You must login first.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  var sampleFile = req.files.sampleFile;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('python/'+sampleFile.name, function(err) {
    if (err){
      print(err)
      return res.status(500).send(err);
    }
  var uuid = guid();
  uuid += ".txt";
  var options = {
    args: [sampleFile.name, uuid]
  }

  PythonShell.run('python/testscript.py', options, function (err) {
      if (err) throw err;
      console.log('finished');
      var file = __dirname+'/python/'+sampleFile.name
      //res.download(file); // Set disposition and send it.
      //res.send("https://user.tjhsst.edu/2018eberlik/"+uuid);
      res.send("")
    });

  });
});

app.post('/makeuser', function(req, res) {
  var name = req.body.name;
  var email = req.body.email;
  make_user(email,name);
});

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function login_with_email_name(email,name){
  db.serialize(function() {
    //db.run("CREATE TABLE lorem (info TEXT)");

    // var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    // for (var i = 0; i < 10; i++) {
    //     stmt.run("Ipsum " + i);
    // }
    // stmt.finalize();
    db.each("SELECT name FROM users where email='"+email+"'", function(err, row) {
        console.log(row.name);
        var data = row.name;
        if(data == name){
          user_status = true;
        }
    });
  });
}

function make_user(email,name){
  db.serialize(function() {
    //db.run("CREATE TABLE lorem (info TEXT)");

    // var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    // for (var i = 0; i < 10; i++) {
    //     stmt.run("Ipsum " + i);
    // }
    // stmt.finalize();

    db.run("insert into users values('"+email+"','"+name+"');")
    db.each("SELECT * FROM users", function(err, row) {
        console.log(row.email + ": " + row.name);
    });
  });

}


// app.get('/download', function(req, res){
//   var file = __dirname + '/python/output.txt';
//   res.download(file); // Set disposition and send it.
// });
