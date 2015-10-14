/**
 * http://usejsdoc.org/
 */

var model = require('./model');

var point = model.point;
var snake = model.snake;



var candypos = new point(600, 400);
var postete = new point(500, 300);
var poselem = [];
var serp = new snake(postete, poselem);
serp.normalize(candypos);
serp.update();
console.log(serp.tete.x);
console.log(serp.tete.y);


