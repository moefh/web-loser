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
        marginLeft : marginLeft,
        marginTop : marginTop,
        paddingLeft : padding,
        paddingRight : padding,
        paddingTop : padding,
        paddingBottom : padding,
    });
};
Browser.prototype.osdClear = function(){
    var padding = 200;
    var marginLeft = -Math.round($('#msg').width()/2 + padding);
    var marginTop = -Math.round($('#msg').height()/2 + padding);

    $('#msg').animate({
        marginLeft: marginLeft,
        marginTop: marginTop,
        paddingLeft : padding,
        paddingRight : padding,
        paddingTop : padding,
        paddingBottom : padding,
        opacity : 0
    }, {
        duration: 'fast',
        complete: function(){
            $('#messages').empty();
        }
    });
};
/**
 * Handles .centerBox class, changing size of main box objects
 */
Browser.prototype.setCenterBoxSize = function(w, h, conf){
    if(typeof(conf) == 'object' && conf.animate == true){
        $('.centerBox').animate({
            width: w,
            height: h,
            marginLeft: -w / 2,
            marginTop: -h / 2
        }, {
            queue : false
        });
    } else {
        $('.centerBox').css({
            width: w,
            height: h,
            marginLeft: -w / 2,
            marginTop: -h / 2
        });
    }
};
Browser.prototype.scaleCustomScreen = function(conf){
    this.setCenterBoxSize(this.options.screen_width, this.options.screen_height, conf);
};
Browser.prototype.scaleFullScreen = function(conf) {
    var w = $(window).width();
    var h = $(window).height();
    var screenSize = this.screen.getSize();
    var game_aspect = screenSize.width/screenSize.height;

    if(w/h > game_aspect)
        w = Math.round(h * game_aspect);
    else
        h = Math.round(w / game_aspect);

    this.setCenterBoxSize(w,h, conf);
};
Browser.prototype.scaleScreen = function(conf){
    if(this.options.full_screen)
        this.scaleFullScreen(conf);
    else
        this.scaleCustomScreen(conf);
}
Browser.prototype.toggleFullScreen = function(){
    this.options.full_screen = ! this.options.full_screen;
    this.scaleScreen({animate: true});
};
Browser.prototype.enableFastScaling = function(){
    $('.centerBox').css({
        imageRendering: 'optimizeSpeed',
        '-ms-interpolation-mode': 'nearest-neighbor'
    });
    $('.centerBox').css({
        imageRendering: 'optimize-contrast'
    });
    $('.centerBox').css({
        imageRendering: 'crisp-edges'
    });
    $('.centerBox').css({
        imageRendering: '-moz-crisp-edges'
    });
    $('.centerBox').css({
        imageRendering: '-webkit-optimize-contrast'
    });
}
Browser.prototype.disableFastScaling = function(){
    $('.centerBox').css({
        imageRendering: 'optimizeQuality',
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
