
/**
 * An NPC is any object of the game (player, enemy, item, etc).
 */
function NPC() {
}

NPC.make = function(type) {
    var npc;
    switch (type) {
    case "loserboy":
    case "punkman":
    case "stickman":
    case "blacknight":
        npc = new Player();
        break;

    case "missile":
        npc = new NPCMissile();
        break;

    case "energy":
        npc = new NPCEnergy();
        break;

    case "power-up":
        npc = new NPCPowerUp();
        break;

    case "tele/teleporter":
        npc = new NPCTeleporter();
        break;

    case "loser-shadow":
        npc = new Enemy();
        break;

    default:
        npc = new NPC();
        break;
    }

    npc.init(type);
    return npc;
}

NPC.prototype.init = function(type) {
    this.type = type;

    // logical position on map
    this.x = 0;
    this.y = 0;

    // direction
    this.dir = 0;

    // image frame
    this.frame = 0;

    // npc definition data
    this.def = npc_def[type];
};

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

NPC.prototype.step = function(game) {
};

NPC.prototype.can_collect_items = function() {
    return false;
}

NPC.prototype.can_teleport = function() {
    return false;
}

/**
 * Missile
 */
function NPCMissile() {}
NPCMissile.prototype = new NPC();

NPCMissile.prototype.step = function(game) {
    if (game.collision.check_collision(game.map, this.x + this.def.clip[0], this.y + this.def.clip[1], this.def.clip[2], this.def.clip[3])) {
        game.remove_npc(this);
        return;
    }
    if (this.dir == DIR_LEFT)
        this.x -= 2*c_int(MAX_WALK_SPEED/1000);
    else
        this.x += 2*c_int(MAX_WALK_SPEED/1000);
};

/**
 * Energy
 */
function NPCEnergy() {}
NPCEnergy.prototype = new NPC();

NPCEnergy.prototype.step = function(game) {
    if (typeof(this.start_y) == "undefined")
        this.start_y = this.y;
    var t = 2 * Math.PI * ((game.frame_counter % 20) / 20);
    this.y = this.start_y + c_int(4 * Math.cos(t));

    for (var i in game.npcs) {
        if (!(game.npcs[i] === this) && game.npcs[i].can_collect_items() && this.collides_with(game.npcs[i])) {
            game.remove_npc(this);
            // TODO: add energy to player
        }
    }
};

/**
 * PowerUp
 */
function NPCPowerUp() {}
NPCPowerUp.prototype = new NPC();

NPCPowerUp.prototype.step = function(game) {
    if (typeof(this.start_y) == "undefined")
        this.start_y = this.y;
    var t = 2 * Math.PI * ((game.frame_counter % 20) / 20);
    this.y = this.start_y + c_int(4 * Math.cos(t));

    // TODO: check if player got power-up
};

/**
 * Teleporter
 */
function NPCTeleporter() {}
NPCTeleporter.prototype = new NPC();

NPCTeleporter.prototype.step = function(game) {
    if (this.target) {
        var t = 2 * Math.PI * ((game.frame_counter % 22) / 22);
        this.frame = c_int(1.55 + 1.55 * Math.cos(t));

        for (var i in game.npcs) {
            if (!(game.npcs[i] === this) && game.npcs[i].can_teleport() && this.collides_with(game.npcs[i])) {
                game.npcs[i].x = this.target.x;
                game.npcs[i].y = this.target.y;
            }
        }
    }
};
