/**
 * @class Event
 * Custom events handler
 * @author Guto Motta
 * Constructor prepares for special ERROR event
 */
function Event(errTag, errHandler, errObj) {
    var errTag;

    this.errTag = errTag;
    this.bind(errTag, errHandler, errObj);
}

/*
 * Trigger custom event TAG passing additional DATA
 */
Event.prototype.trigger = function(tag, data) {
    //console.log('Event triggered: ' + tag + ', data: ' + data);
    $(document).trigger(tag, data);
};
/*
 * Trigger special ERROR event
 */
Event.prototype.error = function(data) {
    this.trigger(this.errTag, data);
};
/*
 * Use $.proxy to fix obj as the scope for handler f
 */
Event.prototype.bind = function(tag, f, obj) {
    //Currently accepting single handler per tag, unbind older
    $(document).unbind(tag);
    $(document).bind(tag, $.proxy(f, obj));
};