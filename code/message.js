/**
 * @class Message
 * Handles text messages display
 * @author Guto Motta
 */
function Message(obj) {
    var $out;
    // jQuery object for <div> messages container
    this.$out = obj;
}

Message.prototype.osd = function(msg){
    this.$out.hide();
    this.$out.empty().append('<p>'+msg+'</p>');
    this.$out.fadeIn('fast');
};
Message.prototype.osdClear = function(){
    this.$out.fadeOut('fast');
};
