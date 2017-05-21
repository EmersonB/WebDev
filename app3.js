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
var sqlite3 = require('sqlite3').verbose();

exports.engine = 'hbs';

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

app.get('/', function(req, res) {
  //res.sendFile('index.html', {root: __dirname });
  var template = require( __dirname+'/home.hbs');
  var data = { "title": "Emerson"};
  var result = template(data);
  res.send(result);

  // PythonShell.run('python/testscript.py', function (err) {
  //   if (err) throw err;
  //   console.log('finished');
  // });

});

app.post('/upload', function(req, res) {
  //console.log(req.files.sampleFile.name);
  if (!req.files.sampleFile){
    print(err)
    return res.status(400).send('No files were uploaded.');
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
      res.send("https://user.tjhsst.edu/2018eberlik/"+uuid);
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

function make_user(email,name){
  db.serialize(function() {
    //db.run("CREATE TABLE lorem (info TEXT)");

    // var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    // for (var i = 0; i < 10; i++) {
    //     stmt.run("Ipsum " + i);
    // }
    // stmt.finalize();

    db.run("insert into users values('"+email+"','"+name+"');")
    // db.each("SELECT * FROM users", function(err, row) {
    //     console.log(row.name + ": " + row.email);
    // });
  });

  //db.close();
}


// app.get('/download', function(req, res){
//   var file = __dirname + '/python/output.txt';
//   res.download(file); // Set disposition and send it.
// });
