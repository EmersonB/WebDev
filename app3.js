// #!/usr/bin/nodejs
// ABOVE LINE FOR TJ SERVER

var express = require('express');
var path = require('path')
var app = express();
var Handlebars = require('handlebars');
var cheerio = require('cheerio');
var fileUpload = require('express-fileupload');
var PythonShell = require('python-shell');

exports.engine = 'hbs';

app.use(fileUpload());

app.use(require('./controllers'));

app.set('port', process.env.PORT || 8080);

var listener = app.listen(app.get('port'), function() {
  console.log( listener.address().port );
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
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
  if (!req.files){
    print(err)
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  var sampleFile = req.files.sampleFile;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('python/input.txt', function(err) {
    if (err){
      print(err)
      return res.status(500).send(err);
    }

    PythonShell.run('python/testscript.py', function (err) {
      if (err) throw err;
      console.log('finished');
    });

    res.send('File uploaded!');
  });
});

app.get('/download', function(req, res){
  var file = __dirname + '/python/output.txt';
  res.download(file); // Set disposition and send it.
});
