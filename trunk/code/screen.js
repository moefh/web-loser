
function Screen(lw, lh, canvas)
{
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.x = 0;
    this.y = 0;
    
    this.w = canvas.width;
    this.h = canvas.height;

    this.logical_w = Math.round(lw);
    this.logical_h = Math.round(lh);

    this.scale_x = this.w / this.logical_w;
    this.scale_y = this.h / this.logical_h;
    
    this.tile_w = 64 * this.scale_x;
    this.tile_h = 64 * this.scale_y;
}

Screen.prototype.show_message = function(x, y, msg) {
    this.ctx.font = "12pt sans-serif";
    this.ctx.textBaseline = "top";
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.w, this.h);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(msg, x, y);
};

Screen.prototype.draw_map_bg = function(map) {
    //debug("draw_map: screen_x=" + screen_x + ", screen_y=" + screen_y);
    var tile_start_x = Math.floor(this.x / 64);
    var tile_start_y = Math.floor(this.y / 64);
    for (var y = 0; y < (this.logical_h/64)+1; y++) {
        for (var x = 0; x < (this.logical_w/64)+1; x++) {
            var pos_x = (64*x - this.x%64) * this.scale_x;
            var pos_y = (64*y - this.y%64) * this.scale_y;
            
            var tile_id = map.bg_tile(tile_start_x + x, tile_start_y + y);
            if (tile_id != 0xffff) {
                var tile_x = tile_id % 16;
                var tile_y = Math.floor(tile_id / 16);
                this.ctx.drawImage(map.get_image(), tile_x*64, tile_y*64, 64, 64, pos_x, pos_y, this.tile_w, this.tile_h);
            }
        }
    }
};

Screen.prototype.draw_map_fg = function(map) {
    //debug("draw_map: screen_x=" + screen_x + ", screen_y=" + screen_y);
    var tile_start_x = Math.floor(this.x / 64);
    var tile_start_y = Math.floor(this.y / 64);
    for (var y = 0; y < (this.h/this.tile_h)+1; y++) {
        for (var x = 0; x < (this.w/this.tile_w)+1; x++) {
            var pos_x = (64*x - this.x%64) * this.scale_x;
            var pos_y = (64*y - this.y%64) * this.scale_y;

            var tile_id = map.fg_tile(tile_start_x + x, tile_start_y + y);
            if (tile_id != 0xffff) {
                var tile_x = tile_id % 16;
                var tile_y = Math.floor(tile_id / 16);
                this.ctx.drawImage(map.get_image(), tile_x*64, tile_y*64, 64, 64, pos_x, pos_y, this.tile_w, this.tile_h);
            }
        }
    }
};

Screen.prototype.draw_frame = function(image, index, frame_w, frame_h, x, y) {
    var img_x = index % 16;
    var img_y = Math.floor(index / 16);
    this.ctx.drawImage(image, img_x*frame_w, img_y*frame_h, frame_w, frame_h,
                       x*this.scale_x, y*this.scale_y,
                       frame_w*this.scale_x, frame_h*this.scale_y);
};

Screen.prototype.draw_npc = function(images, npc) {
    var def = npc.def;
    var x = npc.get_img_x() - this.x;
    var y = npc.get_img_y() - this.y;
    if (x > -def.w && y > -def.h && x < this.w && y < this.h)
        this.draw_frame(images.get_image(def.image), npc.frame, def.w, def.h, x, y);
};

Screen.prototype.draw_npcs = function(images, npcs, follow_npc) {
    for (var npc_id in npcs) {
        var npc = npcs[npc_id];
        if (npc != follow_npc)
            this.draw_npc(images, npc);
    }
    if (follow_npc != null)
        this.draw_npc(images, follow_npc);
};

Screen.prototype.draw = function(images, map, npcs, follow_npc) {
    // change the screen position to follow a NPC, if necessary
    if (follow_npc != null) {
        if (this.x > follow_npc.x - 100) this.x = follow_npc.x - 100;
        if (this.y > follow_npc.y - 90) this.y = follow_npc.y - 90;
        if (this.x + this.logical_w < follow_npc.x + follow_npc.def.w + 100)
            this.x = follow_npc.x + follow_npc.def.w + 100 - this.logical_w;
        if (this.y + this.logical_h < follow_npc.y + follow_npc.def.h + 100)
            this.y = follow_npc.y + follow_npc.def.h + 100 - this.logical_h;
    }

    // limit the the screen position to be inside the map
    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = 0;
    if (this.x > map.w * 64 - this.logical_w)
        this.x = map.w * 64 - this.logical_w;
    if (this.y > map.h * 64 - this.logical_h)
        this.y = map.h * 64 - this.logical_h;
    
    // draw everything
    this.draw_map_bg(map);
    this.draw_npcs(images, npcs, follow_npc);
    this.draw_map_fg(map);
};
