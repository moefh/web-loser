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
    
    var self = this;
    $('#messages').click(function(){
        self.event.trigger('OSD_CLICK');
    });
}
/**
 * Handles OSD for simple text messages
 */
Browser.prototype.osd = function(msg){
    $('#messages').hide();
    $('#messages').empty().append('<span id="msg">'+msg+'</span>');

    $('#messages').fadeIn('fast');
    // #messages need to be 'visible' to get jQuery's width and height
    var padding = 20;
    var marginLeft = -Math.round($('#msg').width()/2 + padding);
    var marginTop = -Math.round($('#msg').height()/2 + padding);
    
    $('#msg').css({
        'marginLeft' : marginLeft,
        'marginTop' : marginTop,
        'padding-left' : padding,
        'padding-right' : padding,
        'padding-top' : padding,
        'padding-bottom' : padding,
    });
};
Browser.prototype.osdClear = function(){
    var padding = 200;
    var marginLeft = -Math.round($('#msg').width()/2 + padding);
    var marginTop = -Math.round($('#msg').height()/2 + padding);

    $('#msg').animate({
        'marginLeft': marginLeft,
        'marginTop': marginTop,
        'padding-left' : padding,
        'padding-right' : padding,
        'padding-top' : padding,
        'padding-bottom' : padding,
        'opacity' : 0
    }, 'fast', function(){
        $('#messages').empty();
    });
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
