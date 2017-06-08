//var mongojs = require("mongojs");
var db = null;//mongojs('localhost:27017/myGame', ['account','progress']);

require('./Entity');
require('./client/Inventory');
var cookieSession = require('cookie-session')
var simpleoauth2 = require("simple-oauth2");
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var request = require('request');

app.set('trust proxy', 1) // trust first proxy

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

var ion_client_id = 'GCth7IMxd0hEVwJ14bTh7d7VU5vOtPmqYpKWuXFp';
var ion_client_secret = 'XMpTxARzTJ9Xg2tDeitySHXZINJRYre3dOGwkJT4LtR5y7fL5dT3K2ohAg5LISzPpNROtrCKDS1FOb3VNKiwcRJnULAAjGGgVIKuLxKbCSCilkgkvSReVOgtgl7H3pMu';
var ion_redirect_uri = 'http://localhost:8080/login';

var oauth2 = simpleoauth2.create({
  client: {
    id: ion_client_id,
    secret: ion_client_secret,
  },
  auth: {
    tokenHost: 'https://ion.tjhsst.edu/oauth/',
    authorizePath: 'https://ion.tjhsst.edu/oauth/authorize',
    tokenPath: 'https://ion.tjhsst.edu/oauth/token/'
  }
});

var authorizationUri = oauth2.authorizationCode.authorizeURL({
    scope: "read",
    redirect_uri: ion_redirect_uri
});

app.get('/login', (req, res,next) => {

    var theCode = req.query.code // GET parameter

    var options = {
        code: theCode,
        redirect_uri: ion_redirect_uri
     };
    oauth2.authorizationCode.getToken(options, (error, result) => {
        if (error) {
            console.log(error);
            return res.json('Authentication failed');
        }
        var token = oauth2.accessToken.create(result);
        req.session.token = token;
        console.log(req.session.token);

        return res.json(token);
    });

});

app.get('/ion', function (req, res, next) {
    // Update views
    req.session.views = (req.session.views || 0) + 1
    var login = '<a href="'+authorizationUri+'">Log in with ION Oauth</a><br>';

    if (typeof req.session.token != 'undefined') {
        var access_token = req.session.token.token.access_token;
        console.log(access_token);
        // request.get({url:'https://ion.tjhsst.edu/api/profile?format=json', access_token:access_token }, function (e, r, body) {
        //     console.log(body);
        // })
        request.get({url:'https://ion.tjhsst.edu/api/profile?format=json&access_token='+access_token}, function (e, r, body) {
            console.log(body);
            login = "Hello "+JSON.parse(body)["display_name"];
            res.send(login);
        })
    } else {
        console.log('no token');
        res.send(login);
    }


});

app.get('/user', function (req, res, next) {

    if (typeof req.session.token != 'undefined') {
        var access_token = req.session.token.token.access_token;

        request.get({url:'https://ion.tjhsst.edu/api/profile?format=json&access_token='+access_token}, function (e, r, body) {

            res.send(JSON.parse(body));
        })
    } else {
        console.log('no token');
        res.send({});
    }
});

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 8080);
console.log("Server started.");

var SOCKET_LIST = {};


var DEBUG = true;

var isValidPassword = function(data,cb){
	return cb(true);
	/*db.account.find({username:data.username,password:data.password},function(err,res){
		if(res.length > 0)
			cb(true);
		else
			cb(false);
	});*/
}
var isUsernameTaken = function(data,cb){
	return cb(false);
	/*db.account.find({username:data.username},function(err,res){
		if(res.length > 0)
			cb(true);
		else
			cb(false);
	});*/
}
var addUser = function(data,cb){
	return cb();
	/*db.account.insert({username:data.username,password:data.password},function(err){
		cb();
	});*/
}

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Math.random();

	SOCKET_LIST[socket.id] = socket;

	socket.on('signIn',function(data){ //{username,password}
			if (typeof data != 'undefined') {
					Player.onConnect(socket,data.username);
					socket.emit('signInResponse',{success:true});
			}
			else{
				socket.emit('signInResponse',{success:false});
			}
	});
	socket.on('signUp',function(data){
		// isUsernameTaken(data,function(res){
		// 	if(res){
		// 		socket.emit('signUpResponse',{success:false});
		// 	} else {
		// 		addUser(data,function(){
		// 			socket.emit('signUpResponse',{success:true});
		// 		});
		// 	}
		// });

		if (typeof data != 'undefined') {
				Player.onConnect(socket,data.username);
        socket.emit('signUpResponse',{success:true});
    }
		else{
			socket.emit('signUpResponse',{success:false});
		}
	});


	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});

	socket.on('evalServer',function(data){
		if(!DEBUG)
			return;
		var res = eval(data);
		socket.emit('evalAnswer',res);
	});



});


setInterval(function(){
	var packs = Entity.getFrameUpdateData();
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('init',packs.initPack);
		socket.emit('update',packs.updatePack);
		socket.emit('remove',packs.removePack);
	}

},1000/25);

/*
var profiler = require('v8-profiler');
var fs = require('fs');
var startProfiling = function(duration){
	profiler.startProfiling('1', true);
	setTimeout(function(){
		var profile1 = profiler.stopProfiling('1');

		profile1.export(function(error, result) {
			fs.writeFile('./profile.cpuprofile', result);
			profile1.delete();
			console.log("Profile saved.");
		});
	},duration);
}
startProfiling(10000);
*/
