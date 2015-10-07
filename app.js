
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , path = require('path');

var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('private/key.pem');
var certificate = fs.readFileSync('private/cert.pem');

var credentials = {key: privateKey, cert: certificate};
var app = express();

// all environments
app.set('port', process.env.PORT || 4710);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.listen();

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = https.createServer(credentials, app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({server:server});
var pos = 0;

wss.on('connection', function connection(ws)
{
	console.log("Client connected");
	ws.on('message', function message(event) {
		var click = JSON.parse(event.data);
	});
});


