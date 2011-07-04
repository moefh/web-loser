/**
 * @class Browser
 * Handles additional browser interaction
 * @author Guto Motta
 */

var DEFAULT_WIDTH = 640;
var DEFAULT_HEIGHT = 480;

function Browser(screen) {
    this.screen = screen;
    this.fullScreen = 0;
    this.growScreen();
}
/**
 * Handles OSD for simple text messages
 */
Browser.prototype.osd = function(msg){
    $('#messages').hide();
    $('#messages').empty().append('<p>'+msg+'</p>');
    $('#messages').fadeIn('fast');
};
Browser.prototype.osdClear = function(){
    $('#messages').fadeOut('fast');
};
/**
 * Handles .centerBox class, changing size of main box objects
 */
Browser.prototype.setCenterBoxSize = function(w, h){
    $('.centerBox').css({
        'width': w,
        'height': h,
        'marginLeft': -w / 2,
        'marginTop': -h / 2
    });
};
Browser.prototype.growSmallScreen = function(){
    this.setCenterBoxSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
};
Browser.prototype.growFullScreen = function() {
    var w = $(window).width();
    var h = $(window).height();
    var screenSize = this.screen.getSize();
    var game_aspect = screenSize.width/screenSize.height;

    if(w/h > game_aspect)
        w = Math.round(h * game_aspect);
    else
        h = Math.round(w / game_aspect);

    this.setCenterBoxSize(w,h);
};
Browser.prototype.growScreen = function(){
    if(this.fullScreen)
        this.growFullScreen();
    else
        this.growSmallScreen();
}
Browser.prototype.toggleFullScreen = function(){
    this.fullScreen = (this.fullScreen+1) % 2;
    this.growScreen();
};
