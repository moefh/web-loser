/**
 * @class Browser
 * Handles additional browser interaction
 * @author Guto Motta
 */

var DEFAULT_WIDTH = 640;
var DEFAULT_HEIGHT = 480;

function Browser(screen, event) {
    this.screen = screen;
    this.event = event;
    this.fullScreen = 0;
    this.growScreen();
    
    $(window).resize($.proxy(this.growScreen, this));
    
    $('#messages').click(function(){
        self.event.trigger('OSD_CLICK');
    });
}
/**
 * Handles OSD for simple text messages
 */
Browser.prototype.osd = function(msg){
    self = this;
    $('#messages').hide();
    $('#messages').empty().append('<span>'+msg+'</span>');
    $('#messages').fadeIn('fast');
};
Browser.prototype.osdClear = function(){
    $('#messages').fadeOut('fast');
};
/**
 * Handles .centerBox class, changing size of main box objects
 */
Browser.prototype.setCenterBoxSize = function(w, h, animate){
    if(animate == 1){
        $('.centerBox').animate({
            'width': w,
            'height': h,
            'marginLeft': -w / 2,
            'marginTop': -h / 2
        });
    } else {
        $('.centerBox').css({
            'width': w,
            'height': h,
            'marginLeft': -w / 2,
            'marginTop': -h / 2
        });
    }
};
Browser.prototype.growSmallScreen = function(animate){
    this.setCenterBoxSize(DEFAULT_WIDTH, DEFAULT_HEIGHT, animate);
};
Browser.prototype.growFullScreen = function(animate) {
    var w = $(window).width();
    var h = $(window).height();
    var screenSize = this.screen.getSize();
    var game_aspect = screenSize.width/screenSize.height;

    if(w/h > game_aspect)
        w = Math.round(h * game_aspect);
    else
        h = Math.round(w / game_aspect);

    this.setCenterBoxSize(w,h, animate);
};
Browser.prototype.growScreen = function(animate){
    if(this.fullScreen)
        this.growFullScreen(animate);
    else
        this.growSmallScreen(animate);
}
Browser.prototype.toggleFullScreen = function(){
    this.fullScreen = (this.fullScreen+1) % 2;
    this.growScreen(1);
};
