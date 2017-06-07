var express = require('express');
var app = express();
app.set('port', process.env.PORT || 8080 );
var serv = require('http').Server(app);

app.get('/', function(req,res){
  res.sendFile(__dirname+'index.html')
});


app.use('/client',express.static(__dirname+'client'));
serv.listen(2000);


var io = require('socket.io')(serv,{});

io.sockets.on('connection', function(socket){
  console.log('socket connection');



  socket.on('happy',function(data){

  });
});
