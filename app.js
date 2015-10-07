
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


var radius = 30;
var postete = Math.random() * 1000;

var candypos = Math.random() * 1000;

var rand = Math.random() * 1000;
var vector = rand;
var postrajet = [1000];
var poselem = [150];
poselem.push(radius, radius, radius);
var j = 0;
var i = 0;
var increPos = 6;
var corps = 0;

function onFrame(event) 
{		
	// calcul seulement sur  les positions
	if ((postete - candypos).length <= 2*radius)
	{
		ajout();
	}
	
	postrajet.push(postete);
	var vec = vector.normalize(Math.abs(130));
	
	
	//envoyer postete au client
	postete += vec / 30;

	j = 0;
	while (j < poselem.length) 
	{
		corps = poselem[j];
		//collisions
		if (j > 0)
			if ((postete - corps).length <= radius)
				Respond.end;			
		
		// stocké pos des éléments du serpent
    	poselem[j] = postrajet[i - increPos];
		increPos += 6;
		j++;		
	}
	increPos = 6;
	i++;
	
	//envoi json au client (position élements corps)
	var message = { 
			type : "corps",
			pos : postete,
			posqueue : poselem
	};
	ws.send(message);
}

function ajout()
{
   	poselem.push(radius);
	candypos = Math.random() * 1000;
	
	// envoi position candy au client
	var message = { 
			type : "candy",
			pos : poscandy
	};
	ws.send(message);
}




wss.on('connection', function connection(ws)
{
	// récupération du click et calcul du vecteur
	console.log("Client connected");
	ws.on('message', function message(event) {
		var click = JSON.parse(event.data);
		vector = click - posetete;
		
	});
	
});





