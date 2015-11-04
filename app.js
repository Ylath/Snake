
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

var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({server:server}),
	CLIENTS=[];


// utilisation du model
var model = require('./model');
var point = model.point;
var snake = model.snake;
var game = model.game;

// creation du point candy
var candypos = new point(Math.random() * 1200, Math.random() * 500);

// création des serpents : direction de départ
var firstdirec = new point(Math.random() * 1200, Math.random() * 500);
var firstdirec1 = new point(Math.random() * 1200, Math.random() * 500);

// création des serpents : position de départ
var postete = new point(500, 300);
var postete1 = new point(700, 100);

// création des serpents : création du corps
var poselem = [];
var poselem1 = [];

// création des serpents : initialisation du corps
poselem.push(new point(0,0), new point(0,0), new point(0,0));
poselem1.push(new point(0,0), new point(0,0), new point(0,0));

// création des serpents : initialisation des serpents
var serp = new snake(postete, poselem);
var serp1 = new snake(postete1, poselem1);

//création des serpents : initialisation de la direction
serp.normalize(firstdirec);
serp1.normalize(firstdirec1);

// initialisation du jeu
var jeu = new game(candypos);
var end = false;

// lancement du jeu
setInterval(boucle, 20);

function boucle() 
{
	if (CLIENTS.length >= 2) 
	{
		onFrame(CLIENTS[0], CLIENTS[1]);
	}	
}



function onFrame(ws1, ws2) 
{		
	// si le jeu est fini : je ferme les connexions
	if (end)
	{
		ws1.close();
		ws2.close();
	}
	
	// mise à jour du jeu
	jeu.update();
	
	// vérification si ya eu des collisions
	if (!end)
	{
		// si le joueur 1 a effectué une collision
		if (serp.touch == 1)
		{
			end = true;
			finish (serp1, serp, ws2, ws1);
		}
		// si le joueur 2 a effectué une collision
		else if (serp1.touch == 1)
		{
			end = true;
			finish (serp, serp1, ws1, ws2);
		}
	}
	
	//envoi json aux clients (position élements corps)
	var message = { 
			type : "serpent",
			posun : serp.tete,
			posde : serp1.tete,
			posqueueun : serp.corps,
			posqueuede : serp1.corps,
			poscandy : candypos
	};
	ws1.send(JSON.stringify(message));
	ws2.send(JSON.stringify(message));
}

// fonction qui envoi les messages de victoire (ou de défaite) aux clients
// snake1/ws1 = victoire
// snake2/ws2 = défaite
function finish (snake1, snake2, ws1, ws2) 
{
	var winmessage = { 
			type : "gagné",
			score : snake1.corps.length
	};
	var lostmessage = { 
			type : "perdu",
			score : snake2.corps.length
	};
	ws1.send(JSON.stringify(winmessage));
	ws2.send(JSON.stringify(lostmessage));
}




wss.on('connection', function connection(ws)
{
	console.log("Client connected");
	CLIENTS.push(ws);
	if (CLIENTS.length < 2)
	{
		jeu.snakes.push(serp);
		console.log("Player 1 enter the game");
	}
	else 
	{
		jeu.snakes.push(serp1);
		console.log("Player 2 enter the game");
	}
	

	
	ws.on('message', function message(event) 
	{
		var msg = JSON.parse(event);
		
		switch(msg.type)
		{				
			case "clic" :
				if (ws == CLIENTS[0])
				{
					// modification de la direction (suite au clic) du serpent 1
					serp.normalize(new point(msg.posx, msg.posy));
				}
				if (ws == CLIENTS[1])
				{
					// modification de la direction (suite au clic) du serpent 2
					serp1.normalize(new point(msg.posx, msg.posy));
				}
				break;
		}						
	});	
});	
	
	

