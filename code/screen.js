
function Screen(lw, lh, canvas)
{
    this.x = 0;
    this.y = 0;
    this.w = c_int(lw);
    this.h = c_int(lh);

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');    
    this.canvas.width = this.w;
    this.canvas.height = this.h;

    this.enable_minimap = true;
}

Screen.prototype.getSize = function(){
    return {
        'width': this.w,
        'height': this.h
    };
};

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
    
    // draw background image
    // TODO: large viewport screws this
    if (map.get_bg_image() != null) {
        var img = map.get_bg_image();
        if (img.width < this.w || img.height < this.h) {
            this.ctx.drawImage(img, 0, 0, this.w, this.h);
        }
        else {
            var x = c_int(this.x * (img.width - this.w) / (map.w * 64 - this.w));
            var y = c_int(this.y * (img.height - this.h) / (map.h * 64 - this.h));
            this.ctx.drawImage(img, -x, -y);
        }
    }
    
    var tile_start_x = c_int(this.x / 64);
    var tile_start_y = c_int(this.y / 64);
    for (var y = 0; y < (this.h/64)+1; y++) {
        for (var x = 0; x < (this.w/64)+1; x++) {
            var pos_x = 64*x - this.x%64;
            var pos_y = 64*y - this.y%64;
            
            var tile_id = map.bg_tile(tile_start_x + x, tile_start_y + y);
            if (tile_id != 0xffff) {
                var tile_x = tile_id % 16;
                var tile_y = c_int(tile_id / 16);
                this.ctx.drawImage(map.get_image(), tile_x*64, tile_y*64, 64, 64, pos_x, pos_y, 64, 64);
            }
        }
    }
};

Screen.prototype.draw_map_fg = function(map) {
    //debug("draw_map: screen_x=" + screen_x + ", screen_y=" + screen_y);
    var tile_start_x = c_int(this.x / 64);
    var tile_start_y = c_int(this.y / 64);
    for (var y = 0; y < (this.h/64)+1; y++) {
        for (var x = 0; x < (this.w/64)+1; x++) {
            var pos_x = 64*x - this.x%64;
            var pos_y = 64*y - this.y%64;

            var tile_id = map.fg_tile(tile_start_x + x, tile_start_y + y);
            if (tile_id != 0xffff) {
                var tile_x = tile_id % 16;
                var tile_y = c_int(tile_id / 16);
                this.ctx.drawImage(map.get_image(), tile_x*64, tile_y*64, 64, 64, pos_x, pos_y, 64, 64);
            }
        }
    }
};

Screen.prototype.draw_frame = function(image, index, frame_w, frame_h, x, y) {
    var img_x = index % 16;
    var img_y = c_int(index / 16);
    this.ctx.drawImage(image, img_x*frame_w, img_y*frame_h, frame_w, frame_h,
                       x, y,
                       frame_w, frame_h);
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

Screen.prototype.draw_minimap = function(map, npc) {
    var mmx = this.w - 2*map.w - 5;
    var mmy = 5;
    this.ctx.globalAlpha = 0.66;
    this.ctx.drawImage(map.minimap, mmx, mmy);
    this.ctx.globalAlpha = 1;
    if (npc != null) {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(mmx + c_int(npc.x/32), mmy + c_int(npc.y/32), 2, 2);
    }
};

Screen.prototype.draw = function(images, map, npcs, follow_npc) {
    // change the screen position to follow a NPC, if necessary
    if (follow_npc != null) {
        var border_w = c_int(0.35*this.w);
        var border_h = c_int(0.35*this.h);

        if (this.x > follow_npc.x - border_w) this.x = follow_npc.x - border_w;
        if (this.y > follow_npc.y - border_h) this.y = follow_npc.y - border_h;
        if (this.x + this.w < follow_npc.x + follow_npc.def.w + border_w)
            this.x = follow_npc.x + follow_npc.def.w + border_w - this.w;
        if (this.y + this.h < follow_npc.y + follow_npc.def.h + border_h)
            this.y = follow_npc.y + follow_npc.def.h + border_h - this.h;
    }

    // limit the the screen position to be inside the map
    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = 0;
    if (this.x > map.w * 64 - this.w)
        this.x = map.w * 64 - this.w;
    if (this.y > map.h * 64 - this.h)
        this.y = map.h * 64 - this.h;
    
    if (this.enable_minimap)
        map.reveal_minimap(c_int(this.x/32), c_int(this.y/32), c_int(this.w/32)+1, c_int(this.h/32)+1);

    // draw everything
    this.draw_map_bg(map);
    this.draw_npcs(images, npcs, follow_npc);
    this.draw_map_fg(map);
    if (this.enable_minimap)
        this.draw_minimap(map, follow_npc);
};
