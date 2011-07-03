var images_table = [ 'castle', 'castle3', 'loserboy', 'stickman', 'punkman', 'power' ];
var game;

/**
 * This class is responsible for controlling the whole state of the
 * game.
 */
function Game() {
    this.player = null;
    this.npcs = null;
    this.next_npc_id = 0;
    this.map = null;
    this.updater_id = null;
    this.viewport = {};
 
    var screen_size = document.getElementById('screen_size');
    if (screen_size) {
        var size = /^(\d+)x(\d+)$/.exec(screen_size.value);
        this.setViewport(size[1], size[2]);
    } else
        this.setViewport($(window).width(), $(window).height());
    this.resolutionRatio = 1/2;
   
    this.collision = new Collision();
    this.keyboard = new Keyboard();
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

    // Prevent the browser from scaling the images twice (?). This
    // seems to improve image quality on chrome in some circumstances
    var canvas = document.getElementById('screen');
    canvas.width = Math.round(w);
    canvas.height = Math.round(h);

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

/*
 * Start game after DOM is loaded
 */
$(document).ready( function() {
    game = new Game();
});
