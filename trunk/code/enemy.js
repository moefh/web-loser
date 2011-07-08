
/**
 * Enemy
 */
function Enemy() {}

Enemy.prototype.calc_step = function(game) {
    // TODO: enemy AI to set the appropriate key states into
    // this.keys_down and this.keys_pressed
    var st = c_int(game.frame_counter / 20) % 4;
    switch (st) {
    case 0:
    case 2:
        this.keys_down[CHAR_KEY_LEFT] = 0;
        this.keys_down[CHAR_KEY_RIGHT] = 0;
        break;
    case 1:
        this.keys_down[CHAR_KEY_LEFT] = 0;
        this.keys_down[CHAR_KEY_RIGHT] = 1;
        break;
    case 3:
        this.keys_down[CHAR_KEY_LEFT] = 1;
        this.keys_down[CHAR_KEY_RIGHT] = 0;
        break;
    }
};

Enemy.prototype.can_collect_items = function() {
    return true;
}

Enemy.prototype.can_teleport = function() {
    return true;
}
