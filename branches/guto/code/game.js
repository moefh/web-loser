var images_table = [ 'castle', 'castle3', 'loserboy', 'stickman', 'punkman' ];
var game;

/**
 * This class is responsible for controlling the whole state of the
 * game.
 */
function Game() {
	this.player = null;
	this.npcs = null;
	this.map = null;
	this.updater_id = null;
	this.viewport = {};

	this.keyboard = new Keyboard();

	this.setViewport($(window).width(), $(window).height());
	this.resolutionRatio = 1/2;

	this.screen = new Screen(this.viewport.width * this.resolutionRatio, this.viewport.height * this.resolutionRatio, document.getElementById('screen'));
	this.images = new Images();

	var errTag = 'ERR';
	this.evt = new Event(errTag, this.error, this);
	
	var self = this;

	this.screen.show_message(10, 10, "Loading images...");

	var loadTag = 'IMG_LOADED';
	this.evt.bind(loadTag, self.reset, self);
	this.images.load(images_table, self.evt, loadTag);
}
Game.prototype.setViewport = function(w, h){
	this.viewport.width = w;
	this.viewport.height = h;

	$('.centerBox').css({
		'width': w,
		'height': h,
		'marginLeft': -w / 2,
		'marginTop': -h / 2
	});
};
Game.prototype.error = function(e, data){
	var errMsg = 'Error: ' + data;
	this.screen.show_message(10,10, errMsg);
	console.log(errMsg);
};
Game.prototype.debug = function(str, clear) {
	var el = document.getElementById("debug");
	if (clear)
		el.innerHTML = "";
	el.innerHTML += str + "<br />\n";
};
/**
 * Reset the game: (re)load the map and (re)create the player object,
 * according to the user selection in the HTML.
 */
Game.prototype.reset = function() {
	if (this.updater_id) {
		clearInterval(this.updater_id);
		this.updater_id = null;
	}

	var sel_map = document.getElementById("select_map").value;
	var sel_char = document.getElementById("select_char").value;

	this.screen.show_message(10, 10, "Loading characters...");
	this.npcs = [ new NPC(npc_def[sel_char]) ];
	this.player = new Player(this.npcs[0], new Collision(), this.keyboard);

	var self = this;
	this.screen.show_message(10, 10, "Loading map...");
	this.map = new Map(sel_map);

	var loadTag = 'MAP_LOADED';
	this.evt.bind(loadTag, self.start, self);
	this.map.load(this.images, self.evt, loadTag);
};
/**
 * Start the game: set the player to the initial position and start
 * the step() interval.
 *
 * This method is called automatically by reset().
 */
Game.prototype.start = function() {
	this.player.load_map_parameters(this.map);
	this.player.set_state(50, 100, DIR_RIGHT);
	var self = this;
	this.updater_id = setInterval( function() {
		self.step()
	}, 30);
};
/**
 * Compute and draw n (default: 1) steps of the game.
 */
Game.prototype.step = function(n) {
	if (! n)
		n = 1;
	for (var x = 0; x < n; x++) {
		this.player.calc_step();
		this.player.move(this.map);
		this.screen.draw(this.images, this.map, this.npcs, 0);
		this.keyboard.update();
	}
};
/*
 * Start game after DOM is loaded
 */
$(document).ready( function() {
	game = new Game();
});