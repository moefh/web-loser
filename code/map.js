
/* conversion table from clipping data from the map file to an
 * easy-to-use bitmap specifying which sub-blocks are blocking. */
var map_clip_conv = [ 15, 1, 2, 4, 8, 3, 5, 10, 12, 14, 13, 11, 7, 9, 6, 0 ];

function Map(name)
{
    this.name = name;
    this.image = null;
    this.bg_image = null;
    this.w = 0;
    this.h = 0;
    this.params = null;
    this.fg = null;
    this.bg = null;
    this.clip = null;
    this.clip_map = null;
    this.spawn_points = null;
}

/**
 * Load the map via XMLHttpRequest. The image required by the map (the
 * tileset) must be already loaded in the images object.
 */
Map.prototype.load = function(game, images, events, tag) { 
    //this.load_request(images, ok_func, err_func);
    var self = this;
    var url = 'maps/' + this.name + '.js';
    $.getJSON(url,
              function(data) {
                  self.load_parse(data, game, images, events, tag);
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

Map.prototype.build_minimap = function() {
    var img = document.createElement('canvas');
    img.width = 2*this.w;
    img.height = 2*this.h;

    var c = img.getContext('2d');
    c.fillStyle = '#000000';
    c.fillRect(0, 0, img.width, img.height);

    return img;
};

Map.prototype.reveal_minimap = function(x, y, w, h) {
    var block_fillstyle = '#8888ff';
    var space_fillstyle = '#222266';

    var c = this.minimap.getContext('2d');
    c.fillStyle = block_fillstyle;

    for (var i = 0; i < h; i++) {
        for (var j = 0; j < w; j++) {
            var pos_x = x + j;
            var pos_y = y + i;
            if (pos_x < 0 || pos_x >= 2*this.w || pos_y < 0 || pos_y >= 2*this.h)
                continue;
            if (this.clip_map[pos_y][pos_x]) {
                if (c.fillStyle != block_fillstyle)
                    c.fillStyle = block_fillstyle;
            } else {
                if (c.fillStyle != space_fillstyle)
                    c.fillStyle = space_fillstyle;
            }
            c.fillRect(pos_x, pos_y, 1, 1);
        }
    }
};

Map.prototype.load_parse = function(data, game, images, events, tag) {
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

        var bg_image = data.tileset.replace(/^.*:([^:]+)$/, "$1");
        if (bg_image != data.tileset) {
            this.bg_image = images.get_image(bg_image);
            if (! this.bg_image)
                throw "invalid background image: '" + bg_image + "'";
                
            // Re-scale the background according to map size
            // TODO: there's got to be a better way!
            // XXX: edit the scalling to play with the parallax effect
            var cv = document.createElement('canvas');
            cv.width = Math.ceil(data.size[0] * 64 / 2);
            cv.height = Math.ceil(data.size[1] * 64 / 2);
            var ctx = cv.getContext('2d');
            ctx.drawImage(this.bg_image, 0, 0, cv.width, cv.height);
            this.bg_image = cv;
        }

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
        this.minimap = this.build_minimap();
        
        // insert all NPCs from the map that are part of npc_def into Game
        for (var i in data.objects) {
            if (data.objects[i].npc in npc_def) {
                var npc = game.add_npc(npc_def[data.objects[i].npc],
                                       npc_behavior[data.objects[i].npc]);
                npc.x = data.objects[i].x;
                npc.y = data.objects[i].y;
            }
        }
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

Map.prototype.get_bg_image = function() {
    return this.bg_image;
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
