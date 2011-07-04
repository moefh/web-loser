
var npc_def = {
    loserboy : {
	image : "loserboy",
	w : 51,
	h : 40,
	clip : [ 15, 5, 31, 35 ],

	shoot_frame : 22,

	mirror : 11,
	stand : [ 10 ],
	jump : [ 4 ],
	walk : [ 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 8, 8, 7, 7, 6, 6, 5, 5,
                 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0 ],

        weapons : [
            [ 5, "missile" ]
        ]
    },

    punkman : {
	image : "punkman",
	w : 64,
	h : 64,
	clip: [ 20, 10, 24, 54 ],
	
	mirror : 12,
	stand : [ 11 ],
	jump : [ 10 ],
	walk : [ 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 6, 6, 5, 5, 4, 4, 3, 3 ],

        weapons : [
            [ 5, "missile" ]
        ]
    },

    stickman : {
	image : "stickman",
	w : 33,
	h : 50,
	clip : [ 8, 0, 16, 50 ],
	
	mirror : 12,
	stand : [ 0 ],
	jump : [ 1 ],
	walk : [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ],

        weapons : [
            [ 9, "missile" ]
        ]
    },

    blacknight : {
        image : "blacknight",
        w : 64,
        h : 64,
        clip : [ 25, 17, 23, 41 ],

        mirror : 17,
        stand : [ 0 ],
        jump : [ 6 ],
        walk : [ 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 13,
                 14, 14, 14, 15, 15, 15, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6 ],
        
        weapons : [
            [ 2, "missile" ]
        ]
    },

    missile : {
	image : "power",
	w : 35,
	h : 19,
	clip : [ 0, 0, 33, 17 ],

	mirror : 1,
	stand : [ 0 ],
	jump : [ 0 ],
	walk : [ 0 ]
    }

};
