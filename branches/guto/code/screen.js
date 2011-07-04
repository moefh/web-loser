
function Screen(lw, lh, canvas)
{
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.x = 0;
    this.y = 0;
    
    this.w = canvas.width;
    this.h = canvas.height;

    this.logical_w = lw;
    this.logical_h = lh;    

    this.scale_x = this.w / lw;
    this.scale_y = this.h / lh;
    
    this.tile_w = Math.round(64 * this.scale_x);
    this.tile_h = Math.round(64 * this.scale_y);
}

Screen.prototype.show_message = function(x, y, msg) {
    this.ctx.font = "16pt sans-serif";
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
	    var pos_x = Math.round((64*x - this.x%64) * this.scale_x);
	    var pos_y = Math.round((64*y - this.y%64) * this.scale_y);
	    
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
	    var pos_x = Math.round((64*x - this.x%64) * this.scale_x);
	    var pos_y = Math.round((64*y - this.y%64) * this.scale_y);

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
		       Math.round(x*this.scale_x), Math.round(y*this.scale_y),
		       Math.round(frame_w*this.scale_x), Math.round(frame_h*this.scale_y));
};

Screen.prototype.draw_npcs = function(images, npcs) {
    for (var i = 0; i < npcs.length; i++) {
	var npc = npcs[i];
	var def = npc.def;
	// TODO: check if it's on screen (no need to draw otherwise)
	this.draw_frame(images.get_image(def.image), npc.frame, def.w, def.h, npc.img_x - this.x, npc.img_y - this.y);
    }
};

Screen.prototype.draw = function(images, map, npcs, follow_npc_id) {
    // change the screen position to follow a NPC if necessary
    if (follow_npc_id != null) {
	var npc = npcs[follow_npc_id];
	if (this.x > npc.x - 100) this.x = npc.x - 100;
	if (this.y > npc.y - 90) this.y = npc.y - 90;
	if (this.x + this.logical_w < npc.x + npc.def.w + 100)
	    this.x = npc.x + npc.def.w + 100 - this.logical_w;
	if (this.y + this.logical_h < npc.y + npc.def.h + 100)
	    this.y = npc.y + npc.def.h + 100 - this.logical_h;
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
    this.draw_npcs(images, npcs);
    this.draw_map_fg(map);
};