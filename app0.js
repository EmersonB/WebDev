// #!/usr/bin/nodejs
// ABOVE LINE FOR TJ SERVER

var express = require('express');
var path = require('path')
var app = express();

// This is so express can get to these files
app.use("/css",  express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));

// standard line for heroku
app.set('port', process.env.PORT || 8080);

// ------------------ //
// CONTROLLERS        //
// ------------------ //
app.get('/', function(req, res) {
   res.send('Hello there peoples @\n' + req.connection.remoteAddress);
});

app.get('/index', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/hello.txt', function(req, res){
    var body = 'Hello World. It\'s me';
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', body.length);
    res.end(body);
});
// ------------------ //

// server side logging
var listener = app.listen(app.get('port'), function() {
  console.log( listener.address().port );
});
