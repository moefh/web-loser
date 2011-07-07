/**
 * @class Browser
 * Handles additional browser interaction
 * @author Guto Motta
 */

function Browser(screen, event, options) {
    this.screen = screen;
    this.event = event;
    this.options = options;
    this.scaleScreen();
    this.setScalingType();
    
    $(window).resize($.proxy(this.scaleScreen, this));
    
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
        }, {
            'queue' : false
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
Browser.prototype.scaleSmallScreen = function(animate){
    this.setCenterBoxSize(this.options.screen_width, this.options.screen_height, animate);
};
Browser.prototype.scaleFullScreen = function(animate) {
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
Browser.prototype.scaleScreen = function(animate){
    if(this.options.full_screen)
        this.scaleFullScreen(animate);
    else
        this.scaleSmallScreen(animate);
}
Browser.prototype.toggleFullScreen = function(){
    this.options.full_screen = ! this.options.full_screen;
    this.scaleScreen(1);
};
Browser.prototype.enableFastScaling = function(){
    $('.centerBox').css({
        'image-rendering': 'optimizeSpeed',
        '-ms-interpolation-mode': 'nearest-neighbor'
    });
    $('.centerBox').css({
        'image-rendering': 'optimize-contrast'
    });
    $('.centerBox').css({
        'image-rendering': 'crisp-edges'
    });
    $('.centerBox').css({
        'image-rendering': '-moz-crisp-edges'
    });
    $('.centerBox').css({
        'image-rendering': '-webkit-optimize-contrast'
    });
}
Browser.prototype.disableFastScaling = function(){
    $('.centerBox').css({
        'image-rendering': 'optimizeQuality',
        '-ms-interpolation-mode': 'bicubic',
    });
};
Browser.prototype.setScalingType = function(){
    if (this.options.fast_scaling)
        this.enableFastScaling();
    else
        this.disableFastScaling();
};
Browser.prototype.toggleFastScaling = function(){
    this.options.fast_scaling = ! this.options.fast_scaling;
    this.setScalingType();
};
