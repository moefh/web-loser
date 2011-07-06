
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

NPC.prototype.get_clip_rect = function () {
    // TODO: take into accound DIR_LEFT and DIR_RIGHT
    var x0 = this.x + this.def.clip[0];
    var y0 = this.y + this.def.clip[1];
    var x1 = this.x + this.def.clip[2];
    var y1 = this.y + this.def.clip[3];
    return [x0, y0, x1, y1];
}

NPC.prototype.collides_with = function (other) {
    var mypos = this.get_clip_rect();
    var otherpos = other.get_clip_rect();
    
    // check intersection
    if (mypos[2] < otherpos[0] || mypos[3] < otherpos[1] || mypos[0] > otherpos[2] || mypos[1] > otherpos[3])
        return false;
    else
        return true;
}

var npc_behavior = {};

npc_behavior.missile = function(game) {
    if (game.collision.check_collision(game.map, this.x + this.def.clip[0], this.y + this.def.clip[1], this.def.clip[2], this.def.clip[3])) {
        game.remove_npc(this);
        return;
    }
    if (this.dir == DIR_LEFT)
        this.x -= 2*c_int(MAX_WALK_SPEED/1000);
    else
        this.x += 2*c_int(MAX_WALK_SPEED/1000);
};

npc_behavior.energy = function(game) {
    var t = 2 * Math.PI * ((game.frame_counter % 20) / 20);
    this.y += c_int(2 * Math.cos(t));

    for (var i in game.npcs) {
        if (!(game.npcs[i] === this) && this.collides_with(game.npcs[i])) {
            game.remove_npc(this);
            // TODO: is this a player?
            // TODO: add energy to player
        }
    }
};

npc_behavior['power-up'] = function(game) {
    var t = 2 * Math.PI * ((game.frame_counter % 20) / 20);
    this.y += c_int(2 * Math.cos(t));

    // TODO: check if player got power-up
};

npc_behavior['tele/teleporter'] = function(game) {
    var t = 2 * Math.PI * ((game.frame_counter % 22) / 22);
    this.frame = c_int(1.55 + 1.55 * Math.cos(t));

    // TODO: check and teleport player to target
};
