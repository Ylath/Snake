/**
 * http://usejsdoc.org/
 */

module.exports.point = point;
module.exports.snake = snake;

function point (x, y) {
	this.x = x;
	this.y = y;
}

function snake (tete, corps) {
	this.tete = tete;
	this.corps = corps;
	this.normalize = function(pt) {
		var x = (pt.x - this.tete.x);
		var y = (pt.y - this.tete.y);
		var norme = Math.sqrt((x*x)+(y*y));
		this.deplax = x/norme*5;
		this.deplay = y/norme*5;
	};
	this.update = function() {
		this.tete.x += this.deplax;
		this.tete.y += this.deplay;
	};
}

function game (snake) {
	this.snake = snake;
	this.update = function() {
		
	}
}
