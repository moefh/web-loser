
/**
 * An NPC is any object of the game (player, enemy, item, etc).
 */
function NPC(def) {
    // logical position on map
    this.x = 0;
    this.y = 0;

    // position of image on map (might be different from logical
    // position due to clipping box)
    this.img_x = 0;
    this.img_y = 0;

    // image frame
    this.frame = 0;

    // npc definition data
    this.def = def;
}
