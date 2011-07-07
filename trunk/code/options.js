
function Options()
{
    // default options
    this.screen_width = 640;
    this.screen_height = 480;
    this.full_screen = false;
    this.fast_scaling = false;

    this.load();
}

Options.prototype.get_storage = function() {
    return window.localStorage;
}

Options.prototype.save = function() {
    var storage = this.get_storage();
    if (! storage)
        return false;

    var data = {
        screen_width : this.screen_width,
        screen_height : this.screen_height,
        full_screen : this.full_screen,
        fast_scaling : this.fast_scaling,
    };
    storage.setItem('options', JSON.stringify(data));
    return true;
};

Options.prototype.get_int = function(obj, name) {
    if (name in obj)
        this[name] = parseInt(obj[name]);
};

Options.prototype.get_bool = function(obj, name) {
    if (name in obj)
        this[name] = (obj[name]) ? true : false;
};

Options.prototype.load = function() {
    var storage = this.get_storage();
    if (! storage)
        return false;

    var data = storage.getItem('options');
    if (data != null) {
        var options;
        try {
            options = JSON.parse(data);
        }
        catch (e) {
            options = null;
        }
        if (options != null) {
            this.get_int(options, 'screen_width');
            this.get_int(options, 'screen_height');
            this.get_bool(options, 'full_screen');
            this.get_bool(options, 'fast_scaling');
        }
        return true;
    }
    return false;
};
