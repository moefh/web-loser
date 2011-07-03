
function Images() {
  this.images = [];
}

Images.prototype.get_image = function(name) {
  return this.images[name];
};

Images.prototype.table_loaded = function(table) {
    for (var j = 0; j < table.length; j++)
        if (! this.get_image(table[j]))
            return false;
    return true;
};

Images.prototype.load = function(table, ok_func, err_func) {
    var self = this;
    var called_err_func = false;
    
    for (var i = 0; i < table.length; i++) {
        (function() {           // gotta love javascript scoping rules... :(
            var name = table[i];
            var url = "images/" + name + ".png";
            var img = new Image();
            img.onload = function() {
                self.images[name] = img;
                if (self.table_loaded(table))
                    ok_func();
            };
            img.onerror = function() {
                if (err_func && ! called_err_func) {
                    err_func(url);
          called_err_func = true;
                }
            };
            img.src = url;
        })();
    }
};
