var abaculus = require('abaculus');


var params = {
    zoom: 4,
    scale: 2
    center: {
        x: -122.333144,
        y: 47.626353,
        w: 400,
        h: 400
    },
    format: 'png',
    getTile: function(z,x,y, callback){
                // do something
                return callback(null, buffer, headers);
            },
    limit: {limit}
};
