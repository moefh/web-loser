
/* conversion table from clipping data from the map file to an
 * easy-to-use bitmap specifying which sub-blocks are blocking. */
var map_clip_conv = [ 15, 1, 2, 4, 8, 3, 5, 10, 12, 14, 13, 11, 7, 9, 6, 0 ];

function Map(name)
{
    this.name = name;
    this.image = null;
    this.w = 0;
    this.h = 0;
    this.params = null;
    this.fg = null;
    this.bg = null;
    this.clip = null;
    this.clip_map = null;
    this.spawn_points = null;
}

function test_load(name) {
    var req = new XMLHttpRequest();
    req.open('GET', "maps/" + name + ".js", false);
    req.send(null);
    return req.responseText;
}

/**
 * Load the map via XMLHttpRequest. The image required by the map (the
 * tileset) must be already loaded in the images object.
 */
Map.prototype.load = function(images, events, tag) { 
    //this.load_request(images, ok_func, err_func);
    var self = this;
    var url = 'maps/' + this.name + '.js';
    $.getJSON(url,
              function(data) {
                  self.load_parse(data, images, events, tag);
              }).error(function(jqXHR, message, what) {
                  events.error("Can't load map from '" + url + "': error " + what);
              });
};

/* Convert the w*h clip_data matrix containing the clipping data form
 * the map file to a (2*w)*(2*h) matrix where each element is 1 if the
 * corresponding quarter-block blocks, or 0 if not. */
Map.prototype.build_clipping_map = function(clip_data) {
    var map = [];

    for (var y = 0; y < clip_data.length; y++) {
        map[2*y] = [];
        map[2*y+1] = [];
        for (var x = 0; x < clip_data[y].length; x++) {
            var clip_bits = 0;
            if (clip_data[y][x] <= map_clip_conv.length)
                clip_bits = map_clip_conv[clip_data[y][x]];
            map[2*y][2*x] =     (clip_bits & 1) ? 1 : 0;
            map[2*y][2*x+1] =   (clip_bits & 2) ? 1 : 0;
            map[2*y+1][2*x] =   (clip_bits & 4) ? 1 : 0;
            map[2*y+1][2*x+1] = (clip_bits & 8) ? 1 : 0;
        }
    }

    return map;
};

Map.prototype.get_spawn_points = function(clip_data) {
    var spawns = [];
    for (var y = 0; y < clip_data.length; y++)
        for (var x = 0; x < clip_data[y].length; x++) {
            var data = clip_data[y][x];
            if (data == 16 || data == 17) {
                var spawn = {
                    x : x,
                    y : y,
                    dir : (data == 16) ? DIR_RIGHT : DIR_LEFT
                };
                spawns[spawns.length] = spawn;
            }
        }
    return spawns;
};

Map.prototype.load_parse = function(data, images, events, tag) {
    try {
        if (data.tile_size[0] != 64|| data.tile_size[1] != 64)
            throw "invalid tile size";
        if (data.size[0] <= 0 || data.size[1] <= 0)
            throw "invalid map size";
        if (data.size[1] != data.bg_tiles.length)
            throw "invalid bg tile length";
        if (data.size[1] != data.fg_tiles.length)
            throw "invalid fg tile length";
        if (data.size[1] != data.fg_tiles.length)
            throw "invalid clip tile length";

        var tileset = data.tileset.replace(/^([^:]+):.*$/, "$1");
        this.image = images.get_image(tileset);
        if (! this.image)
            throw "invalid tileset: '" + data.tileset + "'";

        this.w = data.size[0];
        this.h = data.size[1];
        this.params = {
            maxyspeed: data.maxyspeed,
            jumphold: data.jumphold,
            gravity: data.gravity,
            maxxspeed: data.maxxspeed,
            accel: data.accel,
            jumpaccel: data.jumpaccel,
            friction: data.friction,
            frameskip: data.frameskip
        };
        
        this.bg = data.bg_tiles;
        this.fg = data.fg_tiles;
        this.clip = data.clipping;
        this.clip_map = this.build_clipping_map(data.clipping);
        this.spawn_points = this.get_spawn_points(data.clipping);
    }
    catch (e) {
        events.error("error parsing map:\n" + e);
        return;
    }
    events.trigger(tag);
};

Map.prototype.get_image = function() {
    return this.image;
};

/**
 * Return the foreground tile at (x,y), or 0xffff if there's no
 * foreground tile at (x,y).
 */
Map.prototype.fg_tile = function(x, y) {
    if (x < 0 || x >= this.w) return 0xffff;
    if (y < 0 || y >= this.h) return 0xffff;
    return this.fg[y][x];
};

/**
 * Return the background tile at (x,y), or 0xffff if there's no
 * background tile at (x,y).
 */
Map.prototype.bg_tile = function(x, y) {
    if (x < 0 || x >= this.w) return 0xffff;
    if (y < 0 || y >= this.h) return 0xffff
    return this.bg[y][x];
};

/**
 * Return the clipping tile (x,y).
 */
Map.prototype.clip_tile = function(x, y) {
    if (x < 0 || x >= this.w) return 0; 
    if (y < 0 || y >= this.h) return 0;
    return this.clip[y][x];
};

/**
 * Return 1 if the point (x,y), in world coordinates (not tile
 * coordinates) is blocking, 0 if not.
 */
Map.prototype.point_is_blocked = function(x, y) {
    if (x < 0 || x >= 64*this.w) return 1;
    if (y < 0 || y >= 64*this.h) return 1;
    var bx = Math.floor(x/32);
    var by = Math.floor(y/32);
    return this.clip_map[by][bx];
};
