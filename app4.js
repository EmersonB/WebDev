var cookieSession = require('cookie-session')
var express = require('express')
var simpleoauth2 = require("simple-oauth2");

var app = express();

var request = require('request');
app.set('port', process.env.PORT || 8080 );


app.set('trust proxy', 1) // trust first proxy

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))


// OAUTH2 Stuff
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

// Authorization uri definition
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

app.get('/', function (req, res, next) {
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




app.get('/other', function (req, res, next) {
  // Update views
  req.session.otherViews = (req.session.otherViews || 0) + 1

 // check your log file to see session
 console.log(req.session);

  // Write response
  res.end(req.session.otherViews + ' views');
})

var listener = app.listen(app.get('port'), function() {
  console.log( 'Express server started on port: '+listener.address().port );
});
