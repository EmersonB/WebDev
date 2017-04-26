// #!/usr/bin/nodejs 
// ABOVE LINE FOR TJ SERVER

var express = require('express');
var path = require('path')
var app = express();

// use the controllers folder
//		inside of here, are our get functions
app.use(require('./controllers'));

app.set('port', process.env.PORT || 8080);

var listener = app.listen(app.get('port'), function() {
  console.log( listener.address().port );
});
