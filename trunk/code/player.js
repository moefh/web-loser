
/**
 * Handle input from the local player (from the keyboard) to control one NPC.
 */
function Player()
{
}

/**
 * Compute one step of the player.
 */
Player.prototype.calc_step = function(game) {
    this.keys_down[CHAR_KEY_UP] = this.keyboard.keyDown(KEY_UP);
    this.keys_down[CHAR_KEY_DOWN] = this.keyboard.keyDown(KEY_DOWN);
    this.keys_down[CHAR_KEY_LEFT] = this.keyboard.keyDown(KEY_LEFT);
    this.keys_down[CHAR_KEY_RIGHT] = this.keyboard.keyDown(KEY_RIGHT);
    this.keys_down[CHAR_KEY_SHOOT] = this.keyboard.keyDown(KEY_SHOOT);
    this.keys_pressed[CHAR_KEY_UP] = this.keyboard.keyPressed(KEY_UP);
    this.keys_pressed[CHAR_KEY_DOWN] = this.keyboard.keyPressed(KEY_DOWN);
    this.keys_pressed[CHAR_KEY_LEFT] = this.keyboard.keyPressed(KEY_LEFT);
    this.keys_pressed[CHAR_KEY_RIGHT] = this.keyboard.keyPressed(KEY_RIGHT);
    this.keys_pressed[CHAR_KEY_SHOOT] = this.keyboard.keyPressed(KEY_SHOOT);
};

Player.prototype.can_collect_items = function() {
    return true;
}

Player.prototype.can_teleport = function() {
    return true;
}
