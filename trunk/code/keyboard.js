
var KEY_UP = 38;
var KEY_DOWN = 40;
var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_SHOOT = 88;

function Keyboard() {
    this.keys_down = [];
    this.keys_pressed = [];
//    this.noRepeat = {KEY_SHOOT};
    
    var self = this;
    document.onkeydown = function(ev) { self.ev_keydown(ev); };
    document.onkeyup = function(ev) { self.ev_keyup(ev); };
}

Keyboard.prototype.keyPressed = function(key){
    return(this.keys_pressed.indexOf(key) >= 0);
};

Keyboard.prototype.keyDown = function(key){
    return(this.keys_down.indexOf(key) >= 0);
}

Keyboard.prototype.ev_keydown = function(e) {
/*
    var e = window.event || e;

    if (e.keyCode > 256) return;
    
    while (this.keys_down.length < e.keyCode) this.keys_down[this.keys_down.length] = false;
    this.keys_down[e.keyCode] = true;

    //console.log("(" + key_rep + ") key pressed: " + e.keyCode, true);
    while (this.keys_pressed.length < e.keyCode) this.keys_pressed[this.keys_pressed.length] = false;
    this.keys_pressed[e.keyCode] = true;
*/
    if(!this.keyDown(e.keyCode)){
        this.keys_down.push(e.keyCode);
    }
    if(!this.keyPressed(e.keyCode)){
        this.keys_pressed.push(e.keyCode);
    }
};

Keyboard.prototype.ev_keyup = function(e) {
/*
    var e = window.event || e;

    if (e.keyCode > 256) return;
    
    while (this.keys_down.length < e.keyCode) this.keys_down[this.keys_down.length] = false;
    this.keys_down[e.keyCode] = false;
*/
    idx = this.keys_down.indexOf(e.keyCode);
    if(idx >= 0)
        this.keys_down[idx] = 0;
};

Keyboard.prototype.update = function() {
/*
    for (var i = 0; i < this.keys_pressed.length; i++)
        if (this.keys_pressed[i])
            this.keys_pressed[i] = false;
*/
    this.keys_pressed.length = 0;
};
