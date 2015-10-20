
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



var model = require('./model');

var point = model.point;
var snake = model.snake;

var candypos = new point(Math.random() * 1200, Math.random() * 500);
var postete = new point(500, 300);
var firstdirec = new point(Math.random() * 1200, Math.random() * 500);

var poselem = [];
poselem.push(new point(0,0), new point(0,0), new point(0,0));
var serp = new snake(postete, poselem);
serp.normalize(firstdirec);

var radius = 30;

var postrajetx = [1000];
var postrajety = [1000];


var j = 0;
var i = 0;
var increPos = 6;
var corps = 0;





wss.on('connection', function connection(ws)
{
	console.log("Client connected");
	ws.on('message', function message(event) 
	{
		var msg = JSON.parse(event);
		
		switch(msg.type)
		{				
			case "clic" :
				serp.normalize(new point(msg.posx, msg.posy));
				break;
		}		
		
		
		
	});
	setInterval(onFrame, 0.5);
	
	
	function onFrame() 
	{		
		// calcul seulement sur  les positions
		
		serp.update();
		// le snake mange un candy
		
		var x = (candypos.x - serp.tete.x);
		var y = (candypos.y - serp.tete.y);
		var norme = Math.sqrt((x*x)+(y*y));
		
		if (norme <= 2*radius)
		{
			ajout();
		}
		
		
		postrajetx.push(serp.tete.x);
		postrajety.push(serp.tete.y);
		

		j = 0;
		while (j < serp.corps.length) 
		{
			//collisions
			if (j > 0)
			{
				
				var x = (serp.corps[j].x - serp.tete.x);
				var y = (serp.corps[j].y - serp.tete.y);
				var norme = Math.sqrt((x*x)+(y*y));
				
				if (norme <= radius)
				{
					ws.close();
				}
			}

			// stocké pos des éléments du serpent

			serp.corps[j].x = postrajetx[i - increPos];
			serp.corps[j].y = postrajety[i - increPos];
						

			increPos += 6;
			j++;		
		}
	
		increPos = 6;
		i++;
		
			
		
		//envoi json au client (position élements corps)
		var message = { 
				type : "corps",
				pos : serp.tete,
				posqueue : serp.corps,
				poscandy : candypos
		};
		ws.send(JSON.stringify(message));
	}
	
	
	
	
	function ajout()
	{
	   	serp.corps.push(new point(0,0));

	   	candypos.x = Math.random() * 1200;
	   	candypos.y = Math.random() * 500;

		// envoi position candy au client
		var message = { 
				type : "candy",
				poscandy : candypos
		};
		ws.send(JSON.stringify(message));
	}
	
	
	
	
	
	
});
