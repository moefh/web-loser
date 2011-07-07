
var PLAYER_ST_STAND = 0;
var PLAYER_ST_WALK = 1;
var PLAYER_ST_JUMP_START = 2;
var PLAYER_ST_JUMP_END = 3;

var DIR_RIGHT = 0;
var DIR_LEFT = 1;

var MAX_JUMP_SPEED = 14000;
var INC_JUMP_SPEED = 1100;
var DEC_JUMP_SPEED = 1600;
var MAX_WALK_SPEED = 8000;
var INC_WALK_SPEED = 1600;
var INC_WALK_JUMP_SPEED = 400;
var DEC_WALK_SPEED = 800;
var FRAME_DELAY = 0;

/**
 * Handle input from the local player (from the keyboard) to control one NPC.
 */
function Player()
{
}

Player.prototype.init = function(type) {
    NPC.prototype.init.call(this, type);
    this.state = PLAYER_ST_JUMP_END;
    this.dir = DIR_RIGHT;
    this.dx = 0;
    this.dy = 0;
    this.shooting = 0;
    this.weapon_level = 0;
    this.frame_num = 0;
    this.collision = null;
    this.keyboard = null;
}

/**
 * Load the moviment parameters from the map.
 */
Player.prototype.load_map_parameters = function(map) {
    MAX_JUMP_SPEED = map.params.maxyspeed;
    INC_JUMP_SPEED = map.params.jumphold;
    DEC_JUMP_SPEED = map.params.gravity;
    MAX_WALK_SPEED = map.params.maxxspeed;
    INC_WALK_SPEED = map.params.accel;
    INC_WALK_JUMP_SPEED = map.params.jumpaccel;
    DEC_WALK_SPEED = map.params.friction;
    FRAME_DELAY = map.params.frameskip;
};

/**
 * Set the player's initial position and direction.
 */
Player.prototype.set_state = function(x, y, dir) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.frame_num = 0;
    this.dx = this.dy = 0;
};

Player.prototype.input_stand = function() {
    var done_dir = false;

    if (this.keyboard.keyPressed(KEY_UP) && ! done_dir) {
        done_dir = true;
        this.state = PLAYER_ST_JUMP_START;
        this.dy -= MAX_JUMP_SPEED;
        this.frame_num = 0;
    }

    if (this.keyboard.keyDown(KEY_RIGHT) && ! done_dir) {
        done_dir = true;
        this.state = PLAYER_ST_WALK;
        this.dir = DIR_RIGHT;
        this.dx += DEC_WALK_SPEED + 1;  // also used for walking
        this.frame_num = 0;
    }

    if (this.keyboard.keyDown(KEY_LEFT) && ! done_dir) {
        done_dir = true;
        this.state = PLAYER_ST_WALK;
        this.dir = DIR_LEFT;
        this.dx -= DEC_WALK_SPEED + 1;  // also used for walking
        this.frame_num = 0;
    }

};

Player.prototype.input_walk = function() {
    var done_dir = false;

    if (this.keyboard.keyPressed(KEY_UP) && ! done_dir) {
        done_dir = true;
        this.state = PLAYER_ST_JUMP_START;
        this.dy -= MAX_JUMP_SPEED;
        this.frame_num = 0;
    }

    if (this.keyboard.keyDown(KEY_RIGHT) && ! done_dir) {
        done_dir = true;
        this.dir = DIR_RIGHT;
        this.dx += INC_WALK_SPEED;
        if (this.dx > MAX_WALK_SPEED)
            this.dx = MAX_WALK_SPEED;
    }

    if (this.keyboard.keyDown(KEY_LEFT) && ! done_dir) {
        done_dir = true;
        this.dir = DIR_LEFT;
        this.dx -= INC_WALK_SPEED;
        if (this.dx < -MAX_WALK_SPEED)
            this.dx = -MAX_WALK_SPEED;
    }
};

Player.prototype.input_jump_start = function() {
    var done_dir = false;

    if (this.keyboard.keyDown(KEY_RIGHT) && ! done_dir) {
        done_dir = true;
        this.dir = DIR_RIGHT;
        this.dx += INC_WALK_SPEED;
        if (this.dx > MAX_WALK_SPEED)
            this.dx = MAX_WALK_SPEED;
    }

    if (this.keyboard.keyDown(KEY_LEFT) && ! done_dir) {
        done_dir = true;
        this.dir = DIR_LEFT;
        this.dx -= INC_WALK_SPEED;
        if (this.dx < -MAX_WALK_SPEED)
            this.dx = -MAX_WALK_SPEED;
    }

    if (this.keyboard.keyDown(KEY_UP))
        this.dy -= INC_JUMP_SPEED;
    else
        this.state = PLAYER_ST_JUMP_END;
};

Player.prototype.input_jump_end = function() {
    var done_dir = false;

    if (this.keyboard.keyDown(KEY_RIGHT) && ! done_dir) {
        done_dir = true;
        this.dir = DIR_RIGHT;
        this.dx += INC_WALK_SPEED;
        if (this.dx > MAX_WALK_SPEED)
            this.dx = MAX_WALK_SPEED;
    }

    if (this.keyboard.keyDown(KEY_LEFT) && ! done_dir) {
        done_dir = true;
        this.dir = DIR_LEFT;
        this.dx -= INC_WALK_SPEED;
        if (this.dx < -MAX_WALK_SPEED)
            this.dx = -MAX_WALK_SPEED;
    }
};

Player.prototype.fix_frame = function() {
    switch (this.state) {
    case 0:  // PLAYER_ST_STAND
        this.frame_num %= this.def.stand.length;
        this.frame = this.def.stand[this.frame_num];
        break;

    case 1:  // PLAYER_ST_WALK
        this.frame_num %= this.def.walk.length;
        this.frame = this.def.walk[this.frame_num];
        if (this.def.shoot_frame && this.shooting > 0)
            this.frame += this.def.shoot_frame;
        break;

    case 2:  // PLAYER_ST_JUMP_START
    case 3:  // PLAYER_ST_JUMP_END
        this.frame_num %= this.def.jump.length;
        this.frame = this.def.jump[this.frame_num];
        break;

    default:
        this.frame_num = 0;
        this.frame = 0;
    }

    if (this.dir == DIR_LEFT)
        this.frame += this.def.mirror;
};

Player.prototype.apply_floor_friction = function(amount) {
    var tmp = 1;
    if (this.dx < 0) {
        tmp = -1;
        this.dx = -this.dx;
    }
    this.dx -= amount;
    if (this.dx <= 0) {
        this.dx = 0;
        this.state = PLAYER_ST_STAND;
    } else if (tmp < 0)
        this.dx = -this.dx;
};

/**
 * Do one step of the player moviment and animation. Should be called
 * after step().
 */
Player.prototype.move = function(map) {
    if (this.state == PLAYER_ST_WALK || this.state == PLAYER_ST_STAND) {
        // check floor under player
        var delta = this.collision.calc_movement(map, this.x, this.y, this.def.clip[2], this.def.clip[3], 0, 1);
        if (delta == null || delta[1] != 0)   // start falling
            this.state = PLAYER_ST_JUMP_END;
    }

    // gravity
    if (this.state != PLAYER_ST_WALK && this.state != PLAYER_ST_STAND)
        this.dy += DEC_JUMP_SPEED;

    // calculate movement
    var try_dx = c_int(this.dx/1000);
    var try_dy = c_int(this.dy/1000);
    var delta = this.collision.calc_movement(map, this.x, this.y, this.def.clip[2], this.def.clip[3], try_dx, try_dy);
    if (delta && delta[1] != try_dy) {
        if (try_dy > 0) { 
            // hit the ground
            this.state = (this.keyboard.keyDown(KEY_LEFT) || this.keyboard.keyDown(KEY_RIGHT)) ? PLAYER_ST_WALK : PLAYER_ST_STAND;
            this.dy = 0;
        } else {
            // hit the ceiling
            this.dy = -this.dy;
        }
    }
    if (delta && delta[0] != try_dx)
        this.apply_floor_friction(c_int(DEC_WALK_SPEED/2));

    // move
    if (delta) {
        this.x += delta[0];
        this.y += delta[1];
    } else {
        this.x += try_dx;
        this.y += try_dy;
    }
    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = 0;

    // transition states
    switch (this.state) {
    case 0:  // PLAYER_ST_STAND
    case 1:  // PLAYER_ST_WALK
        this.apply_floor_friction(DEC_WALK_SPEED);
        break;

    case 2:  // PLAYER_ST_JUMP_START
        if (this.dy < 0 && this.dy > -DEC_JUMP_SPEED)
            this.state = PLAYER_ST_JUMP_END;
        if (this.dy > MAX_JUMP_SPEED)
            this.dy = MAX_JUMP_SPEED;
        break;

    case 3:  // PLAYER_ST_JUMP_END
        if (this.dy > MAX_JUMP_SPEED)
            this.dy = MAX_JUMP_SPEED;
        break;
    }

    //console.log("y=" + this.y);
    this.frame_num++;
    if (this.shooting > 0)
        this.shooting--;
    this.fix_frame();
};

/**
 * Compute one step of the player.
 */
Player.prototype.calc_step = function(game) {
    switch (this.state) {
    case 0: this.input_stand(); break;
    case 1: this.input_walk(); break;
    case 2: this.input_jump_start(); break;
    case 3: this.input_jump_end(); break;
    }

    if (this.keyboard.keyPressed(KEY_SHOOT)) {
        this.shooting = 5;  // # of frames
        var shot_npc_name = this.def.weapons[this.weapon_level][1];
        var shot = game.add_npc(shot_npc_name);
        shot.x = this.x + c_int(this.def.clip[2]/2);
        shot.y = this.y + this.def.weapons[this.weapon_level][0] - c_int(shot.def.clip[1]/2);
        shot.dir = this.dir;
        shot.frame = 0;
        if (this.dir == DIR_LEFT) {
            shot.x -= shot.def.clip[2];
            shot.frame += shot.def.mirror;
        }
    }
};

NPC.prototype.collects_items = function() {
    return true;
}
Player.prototype.step = function(game) {
    this.calc_step(game);
    this.move(game.map);
};
