
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



var model = require('./model');

var point = model.point;
var snake = model.snake;
var game = model.game;

var jeu = new game();

var candypos = new point(Math.random() * 1200, Math.random() * 500);

var firstdirec = new point(Math.random() * 1200, Math.random() * 500);
var firstdirec1 = new point(Math.random() * 1200, Math.random() * 500);

var postete = new point(500, 300);
var postete1 = new point(700, 100);
var poselem = [];
var poselem1 = [];
poselem.push(new point(0,0), new point(0,0), new point(0,0));
poselem1.push(new point(0,0), new point(0,0), new point(0,0));
var serp = new snake(postete, poselem);
var serp1 = new snake(postete1, poselem1);
serp.normalize(firstdirec);
serp1.normalize(firstdirec1);

var radius = 30;


var j = 0;
var i = 0;
var increPos = 6;


setInterval(boucle, 50);

function boucle() 
{
	if (CLIENTS.length >= 2) 
	{
		onFrame(CLIENTS[0], CLIENTS[1]);
	}	
}



function onFrame(ws1, ws2) 
{		
	// mise à jour positions tete
	jeu.update();

	// parcours du tableau des snakes du jeu
	for (var k = 0; k<jeu.snake.length; k++)
	{
		
		// le snake mange un candy
		var x1 = (candypos.x - jeu.snake[k].tete.x);
		var y1 = (candypos.y - jeu.snake[k].tete.y);
		var norme1 = Math.sqrt((x1*x1)+(y1*y1));
		
		if (norme1 <= 2*radius)
		{
			ajout(jeu.snake[k], ws1, ws2);
		}
	
		// stockage du trajet de la tete
		jeu.snake[k].postrajetx.push(jeu.snake[k].tete.x);
		jeu.snake[k].postrajety.push(jeu.snake[k].tete.y);
	


		for (j = 0; j < jeu.snake[k].corps.length; j++) 
		{
			//collisions
			if (j > 0)
			{
				var x2 = (jeu.snake[k].corps[j].x - jeu.snake[k].tete.x);
				var y2 = (jeu.snake[k].corps[j].y - jeu.snake[k].tete.y);
				var norme2 = Math.sqrt((x2*x2)+(y2*y2));
				
				if (norme2 <= radius)
				{	
					console.log("THE END");
					//ws.close();
				}
			}

			// les éléments du corps suivent la tete
			jeu.snake[k].corps[j].x = jeu.snake[k].postrajetx[i - increPos];
			jeu.snake[k].corps[j].y = jeu.snake[k].postrajety[i - increPos];
						

			increPos += 6;	
		}
	
		increPos = 6;
		i++;
	}
	
	//envoi json au client 1 (position élements corps)
	var message = { 
			type : "serpent",
			posun : jeu.snake[0].tete,
			posde : jeu.snake[1].tete,
			posqueueun : jeu.snake[0].corps,
			posqueuede : jeu.snake[1].corps,
			poscandy : candypos
	};
	ws1.send(JSON.stringify(message));
	ws2.send(JSON.stringify(message));
}


function ajout(serpent, ws1, ws2)
{
   	serpent.corps.push(new point(0,0));

   	candypos.x = Math.random() * 1200;
   	candypos.y = Math.random() * 500;
   	
 // envoi position candy au client
	var message = { 
			type : "candy",
			poscandy : candypos
	};
	ws1.send(JSON.stringify(message));
	ws2.send(JSON.stringify(message));
}



wss.on('connection', function connection(ws)
{
	console.log("Client connected");
	CLIENTS.push(ws);
	if (jeu.snake.length < 1)
	{
		console.log("Player 1 enter the game");
		jeu.snake.push(serp);
	}
	else 
	{
		console.log("Player 2 enter the game");
		jeu.snake.push(serp1);
	}
	

	
	ws.on('message', function message(event) 
	{
		var msg = JSON.parse(event);
		
		switch(msg.type)
		{				
			case "clic" :
				if (ws == CLIENTS[0])
				{
					jeu.snake[0].normalize(new point(msg.posx, msg.posy));
				}
				if (ws == CLIENTS[1])
				{
					jeu.snake[1].normalize(new point(msg.posx, msg.posy));
				}
				break;
		}						
	});	
});	
	
	

