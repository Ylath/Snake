/**
 * http://usejsdoc.org/
 */

module.exports.point = point;
module.exports.snake = snake;
module.exports.game = game;

var radius = 30;

var j = 0;
var increPos = 6;

function point (x, y) {
	this.x = x;
	this.y = y;
}

function snake (tete, corps) {
	this.tete = tete;
	this.corps = corps;
	this.i = 0;
	this.postrajetx = [1000];
	this.postrajety = [1000];

	this.normalize = function(pt) 
	{
		var x = (pt.x - this.tete.x);
		var y = (pt.y - this.tete.y);
		var norme = Math.sqrt((x*x)+(y*y));
		this.deplax = x/norme*5;
		this.deplay = y/norme*5;
	};
	
	this.update = function() 
	{
		// déplacement de la tetes
		this.tete.x += this.deplax;
		this.tete.y += this.deplay;
		
		// stockage du trajet de la tete
		this.postrajetx.push(this.tete.x);
		this.postrajety.push(this.tete.y);
		
		// mouvement du snake
		for (j = 0; j < this.corps.length; j++) 
		{
			// les éléments du corps suivent la tete
			this.corps[j].x = this.postrajetx[this.i - increPos];
			this.corps[j].y = this.postrajety[this.i - increPos];	

			increPos += 6;	
		}
		
		increPos = 6;
		this.i++;
	};
	
	
}

// renvoi la distance entre deux points (passés en paramètres)
function norme(elemA, elemB) 
{
	var x = (elemA.x - elemB.x);
	var y = (elemA.y - elemB.y);
	return Math.sqrt((x*x)+(y*y));
}


function game (candypos) {
	this.snakes = [];
	this.candypos = candypos;
	
	this.update = function ()
	{
		// parcours du tableau de snakes
		for (var k = 0; k < this.snakes.length; k++)
		{
			// déplacement de chaque snake
			this.snakes[k].update();
			
			// le snake a mangé un candy
			if (norme(this.candypos, this.snakes[k].tete) <= 2*radius)
			{
				this.ajout(this.snakes[k]);
			}
			
			// <<< COLLISIONS >>>
			// parcours du corps de chaque snake
			for (var j = 0; j < this.snakes[k].corps.length; j++)
			{
				// parcours du tableau de snake (pour comparer les positions entre les joueurs)
				for (var l = 0; l < this.snakes.length; l++)
				{
					// cas ou le snake compare la position de SA tete avec celle de SON corps
					if (k == l)
					{
						if (norme(this.snakes[k].corps[j], this.snakes[l].tete) <= radius)
						{	
							console.log("THAT ENDING !");
							//ws.close();
						}
					}
					
					// cas ou le snake compare la position de SA tete avec celle du corps D'UN AUTRE snake
					else if (k != l)
					{
						if (norme(this.snakes[k].corps[j], this.snakes[l].tete) <= 2*radius)
						{	
							console.log("THAT ENDING, you suck!");
							//ws.close();
						}
					}
				}				
			}				
		}
	};
	
	this.ajout = function (serpent)
	{
		serpent.corps.push(new point(0,0));

	   	this.candypos.x = Math.random() * 1200;
	   	this.candypos.y = Math.random() * 500;
	};
}



