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
    
    this.keyboard = new Keyboard();
    this.screen = new Screen(320, 240, document.getElementById('screen'));
    this.images = new Images();
    
    var self = this;
    
    this.screen.show_message(10, 10, "Loading images...");
    this.images.load(images_table,
		     function() {
			 self.reset();
		     },
		     function(url) {
			 self.screen.show_message(10, 10, "Error loading image '" + url + "'");
		     });
}

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
    this.map.load(this.images,
		  function() {
		      self.start();
		  },
		  function(msg) {
		      self.screen.show_message(10, 10, "Error loading map:\n" + msg);
		  });
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

$(document).ready( function() {
    game = new Game();
});