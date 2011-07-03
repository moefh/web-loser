var images_table = [ 'castle', 'castle3', 'loserboy', 'stickman', 'punkman', 'power' ];
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
    this.next_npc_id = 0;
    
    this.collision = new Collision();
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
    
    var self = this;
    var sel_map = document.getElementById("select_map").value;
    var sel_char = document.getElementById("select_char").value;
    
    this.screen.show_message(10, 10, "Loading characters...");
    this.npcs = {};

    var player_npc = this.add_npc(npc_def[sel_char],
				  function() {
				      self.player.calc_step(self);
				      self.player.move(self.map);
				  });
    this.player = new Player(player_npc, this.collision, this.keyboard);

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
    var spawn = this.map.spawn_points[0];
    if (spawn)
	this.player.set_state(64*spawn.x, 64*spawn.y, spawn.dir);
    else
	this.player.set_state(5, 5, DIR_RIGHT);
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
	for (var npc_id in this.npcs) {
	    if (this.npcs[npc_id].step_func)
		this.npcs[npc_id].step_func.call(this.npcs[npc_id], this);
	}
	this.screen.draw(this.images, this.map, this.npcs, this.player.npc);
	this.keyboard.update();
    }
};

Game.prototype.add_npc = function(npc_def, handler) {
    var npc = new NPC(npc_def, handler);
    this.npcs[this.next_npc_id++] = npc;
    return npc;
};

Game.prototype.remove_npc = function(npc) {
    for (var npc_id in this.npcs)
	if (this.npcs[npc_id] == npc) {
	    delete this.npcs[npc_id];
	    return true;
	}
    return false;
};

$(document).ready( function() {
    game = new Game();
});