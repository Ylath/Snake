/**
 * http://usejsdoc.org/
 */

module.exports.point = point;
module.exports.snake = snake;
module.exports.game = game;

function point (x, y) {
	this.x = x;
	this.y = y;
}

function snake (tete, corps) {
	this.tete = tete;
	this.corps = corps;
	
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
		this.tete.x += this.deplax;
		this.tete.y += this.deplay;
	};
}

function game () {
	this.snake = [];	
	
	this.update = function() 
	{
		for (var i = 0; i<this.snake.length; i++)
		{
			this.snake[i].update();
		}
	};
}
