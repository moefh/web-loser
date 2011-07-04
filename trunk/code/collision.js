
function Collision() {
}

Collision.prototype.rect_interception = function(a, b) {
    var x, y, w, h;

    x = Math.max(a[0], b[0]);
    y = Math.max(a[1], b[1]);
    w = Math.min(a[0] + a[2], b[0] + b[2]) - x;
    h = Math.min(a[1] + a[3], b[1] + b[3]) - y;

    if (w > 0 && h > 0)
        return [ x, y, w, h ];
    return null;
};

Collision.prototype.clip_rect = function(initial, delta, block) {
    var ending = [
        initial[0] + delta[0],
        initial[1] + delta[1],
        initial[2],
        initial[3]
    ];

    var inter = this.rect_interception(ending, block);
    if (inter) {
        if (ending[0] > initial[0])
            delta[0] -= inter[2];
        else if (ending[0] < initial[0])
            delta[0] += inter[2];

        if (ending[1] > initial[1])
            delta[1] -= inter[3];
        else if (ending[1] < initial[1])
            delta[1] += inter[3];

        return true;
    }
    return false;
};

Collision.prototype.get_block_rect = function(map, x, y) {
    if (map.point_is_blocked(x, y)) {
        var bx = c_int(x/32);
        var by = c_int(y/32);
        //return [ 32*bx, 32*by, 31, 31 ];
        return [ 32*bx, 32*by, 31, 31 ];
    }
    return null;
};

Collision.prototype.clip_block_vertex = function(map, vertex, initial, vel)
{
    // avoid the "chicken bug"
    if (vel[0] + initial[0] < 0) vel[0] = -initial[0];
    if (vel[1] + initial[1] < 0) vel[1] = -initial[1];
    
    var clipped = false;

    if (vel[0] != 0) {
        // clip trying to go to (vertex+[dx,0]), set "clipped" if clipped and update vel[0]
        var block = this.get_block_rect(map, vertex[0]+vel[0], vertex[1]);
        if (block) {
            var delta = [ vel[0], 0 ];
            clipped = this.clip_rect(initial, delta, block) || clipped;
            if (Math.abs(vel[0]) > Math.abs(delta[0]))
                vel[0] = delta[0];
        }
    }

    if (vel[1] != 0) {
        // clip trying to go to (vertex+[0,dy]), set "clipped" if clipped and update vel[0]
        var block = this.get_block_rect(map, vertex[0], vertex[1]+vel[1]);
        if (block) {
            var delta = [ 0, vel[1] ];
            clipped = this.clip_rect(initial, delta, block) || clipped;
            if (Math.abs(vel[1]) > Math.abs(delta[1]))
                vel[1] = delta[1];
        }
    }

    if (! clipped && vel[0] != 0 && vel[1] != 0) {
        // clip trying to go to (vertex+[dx,dy]), set "clipped" if clipped and update vel[0] (not vel[1]: why?)
        var block = this.get_block_rect(map, vertex[0]+vel[0], vertex[1]+vel[1]);
        if (block) {
            var delta = [ vel[0], vel[1] ];
            this.clip_rect(initial, delta, block);
            if (Math.abs(vel[0]) > Math.abs(delta[0]))
                vel[0] = delta[0];
        }
    }
};

/**
 * Check collision of the rectangle (x,y)+(w,h) moving by (dx,dy) in
 * the given map.
 * 
 * Return null if there's no collision or an array [dx,dy] of the
 * largest movement possible before collision.
 */
Collision.prototype.calc_movement = function(map, x, y, w, h, dx, dy)
{
    if (dx == 0 && dy == 0)
        return null;

    w++;
    h++;
    var initial = [ x, y, w, h ];

    var vertices = [
        [ x,             y ],
        [ x+c_int(w/2),  y ],
        [ x+w-1,         y ],
        
        [ x,             y+c_int(h/2) ],
        [ x+w-1,         y+c_int(h/2) ],
        
        [ x,             y+h-1],
        [ x+c_int(w/2),  y+h-1],
        [ x+w-1,         y+h-1]
    ];
    var delta = [ dx, dy ];

    //console.log("== calc_movement:");
    //console.log(initial);
    //console.log(vertices);
    //console.log(delta);

    for (var i = 0; i < vertices.length; i++)
        this.clip_block_vertex(map, vertices[i], initial, delta);

    if (delta[0] != dx || delta[1] != dy)
        return delta;
    return null;
};

Collision.prototype.check_collision = function(map, x, y, w, h) {
    return (map.point_is_blocked(x, y)
            || map.point_is_blocked(x+w, y)
            || map.point_is_blocked(x, y+h)
            || map.point_is_blocked(x+w, y+h));
};

