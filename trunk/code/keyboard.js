
var KEY_UP = 38;
var KEY_DOWN = 40;
var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_SHOOT = 88;

function Keyboard() {
    this.keys_down = [];
    this.keys_pressed = [];
    this.keys_wait = [];
    
    var self = this;
    document.onkeydown = function(ev) { self.ev_keydown(ev); };
    document.onkeyup = function(ev) { self.ev_keyup(ev); };
}
/*
 * Search for KEY in the different keymaps
 */
Keyboard.prototype.keyPressed = function(key){
    return(this.keys_pressed.indexOf(key) >= 0);
};
Keyboard.prototype.keyDown = function(key){
    return(this.keys_down.indexOf(key) >= 0);
}
Keyboard.prototype.keyWait = function(key){
    return(this.keys_wait.indexOf(key) >= 0);
}
/*
 * Removes element E from array
 * Array method, maybe place it somewhere else?
 */
Array.prototype.remove = function(e){
    var idx = this.indexOf(e);
    if(idx >= 0){
        this[idx] = this[this.length - 1];
        this.length--;
    }
}
/*
 * Keydown handler
 */
Keyboard.prototype.ev_keydown = function(e) {
    if(!this.keyDown(e.keyCode)){
        this.keys_down.push(e.keyCode);
    }
    if(!this.keyPressed(e.keyCode) && !this.keyWait(e.keyCode)){
        this.keys_pressed.push(e.keyCode);
        this.keys_wait.push(e.keyCode);
    }
};
/*
 * Keyup handler
 */
Keyboard.prototype.ev_keyup = function(e) {
    this.keys_down.remove(e.keyCode);
    this.keys_wait.remove(e.keyCode);
};
/*
 * Called by step, clears keys_pressed, keeps keys_down
 */
Keyboard.prototype.update = function() {
    this.keys_pressed.length = 0;
};