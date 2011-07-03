
/**
 * An NPC is any object of the game (player, enemy, item, etc).
 */
function NPC(def, step_func) {
    // logical position on map
    this.x = 0;
    this.y = 0;

    // direction
    this.dir = 0;

    // image frame
    this.frame = 0;

    // npc definition data
    this.def = def;

    // step function
    this.step_func = step_func;
}

NPC.prototype.get_img_x = function() {
    if (this.dir == DIR_LEFT)
	return this.x + this.def.clip[0] + this.def.clip[2] - this.def.w;
    else
	return this.x - this.def.clip[0] + 1;
};

NPC.prototype.get_img_y = function() {
    return this.y - this.def.clip[1] + 1;
};
