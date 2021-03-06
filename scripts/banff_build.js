
// /Applications/GPSBabelFE.app/Contents/MacOS/gpsbabel

var fs = require('fs');
var child_process = require('child_process');
var glob = require("glob");
var path = require("path");

var _ = require('lodash');
var moment = require('moment');

var EXIF_DATE_FORMAT = 'YYYY:MM:DD HH:mm:ss';
var PROPER_DATE_FORMAT = 'YYYY/MM/DD HH:mm:ss';

var GPSBABEL_DATE_FORMAT = 'YYYYMMDDHH';

var TRIP = 'bvis';

//todo: file list
glob('raw/'+TRIP+'/*.jpg', function(err, files) {
    var imageJson = child_process.execSync("exiftool -ImageWidth -ImageHeight -GPSPosition -GPSAltitude -GPSDateTime -CreateDate -j -c '%+.8f' " + files.join(' '));
    var images = JSON.parse( imageJson );

// { SourceFile: 'raw/'+TRIP+'/IMG_0890.jpg',
//     ImageWidth: 3264,
//     ImageHeight: 2448,
//     GPSPosition: '+50.70946389, -119.28391389',
//     GPSAltitude: '345 m Above Sea Level',
//     GPSDateTime: '2015:09:06 02:20:44Z',
//     CreateDate: '2015:09:05 19:20:44' }
    images = _.map(images, function(image) {

        var imagePath = path.parse(image.SourceFile);

        var aspectRatio = image.ImageWidth / image.ImageHeight;
        var perspective = 'landscape';
        if (aspectRatio < 1) perspective = 'portrait';
        if (aspectRatio > 2) perspective = 'panorama';



        var imageResp = {
            type: 'image',
            name: imagePath.name,
            perspective: perspective,
            "w": image.ImageWidth,
            "h": image.ImageHeight,
            src: "pictures/full/"+TRIP+"/"+imagePath.name+".jpg",
            msrc: "pictures/thumbs/"+TRIP+"/"+imagePath.name+".jpg",
            msrc2x: "pictures/thumbs/"+TRIP+"/"+imagePath.name+"@2x.jpg",
            date: moment(image.CreateDate, EXIF_DATE_FORMAT).format(PROPER_DATE_FORMAT)
        };

        if ('GPSPosition' in image) {
            var split = image.GPSPosition.split(',');
            imageResp.position = { lat: parseFloat(split[0]), lon: parseFloat(split[1]) };
        }

        if ('GPSAltitude' in image) {
            imageResp.altitude = parseFloat(image.GPSAltitude);
        }

        return imageResp;
    });

    images = _.sortBy(images, 'date');

    fs.writeFileSync(TRIP+'_images.json', JSON.stringify(images));

    //get days from track
    var dayGrouped = _.groupBy(images, function(image) {
        return image.date.slice(0,10);
    });

    var startDay = moment(_.keys(dayGrouped).sort()[0], 'YYYY/MM/DD');
    var args = _.map(dayGrouped, function(group, day) {
        var start = moment(day, 'YYYY/MM/DD').startOf('day').utc().format(GPSBABEL_DATE_FORMAT);
        var stop = moment(day, 'YYYY/MM/DD').endOf('day').utc().format(GPSBABEL_DATE_FORMAT);
        var dayNo =  moment(day, 'YYYY/MM/DD').diff(startDay, 'days')+1;

        return [dayNo, start, stop];
    });

    //remove temp files, as ogr2ogr won't overwrite
    try {
        child_process.execSync("rm .tmp/*.gpx .tmp/*.json");
    } catch (e) {

    }

    var tracks = {};
    if ( args.length > 1 ) {
        child_process.execSync("ogr2ogr -f GeoJSON .tmp/all.json assets/"+TRIP+"/"+TRIP+".gpx tracks");
        var fileContents = fs.readFileSync(".tmp/all.json",'utf8');
        tracks["all"] = JSON.parse(fileContents);
    }
    _.each(args, function(arg) {
        child_process.execSync("gpsbabel -t -i gpx -f assets/"+TRIP+"/"+TRIP+".gpx -x track,pack,start="+arg[1]+",stop="+arg[2]+" -o gpx -F .tmp/day"+arg[0]+".gpx");
        child_process.execSync("ogr2ogr -f GeoJSON .tmp/day"+arg[0]+".json .tmp/day"+arg[0]+".gpx tracks");

        var fileContents = fs.readFileSync(".tmp/day"+arg[0]+".json",'utf8');
        tracks["day"+arg[0]] = JSON.parse(fileContents);
    });



    fs.writeFileSync(TRIP+'_tracks.json', JSON.stringify(tracks));
});



// reformat
// var perspective;
// var basename = p.SourceFile.split('.')[0];

// return {
//     index: i,
//     basename: basename,
//     "w": p.ImageWidth,
//     "h": p.ImageHeight,
//     src: "pictures/full/banff/"+basename+".jpg",
//     msrc: "pictures/thumbs/banff/"+basename+".jpg",
//     msrc2x: "pictures/thumbs/banff/"+basename+"@2x.jpg"
// };

//max altitude
//list of days
//for each day, make start/stop

//
// gpsbabel - t - i gpx - f Banff.gpx - x track, pack, start = 2015090616, stop = 2015090704 - o gpx - F day2.gpx
// gpsbabel - t - i gpx - f Banff.gpx - x track, pack, start = 2015090716, stop = 2015090805 - o gpx - F day3.gpx
// gpsbabel - t - i gpx - f Banff.gpx - x track, pack, start = 2015090815, stop = 2015090907 - o gpx - F day4.gpx

// ogr2ogr - f GeoJSON all.json Banff.gpx tracks
// ogr2ogr - f GeoJSON day1.json day1.gpx tracks
// ogr2ogr - f GeoJSON day2.json day2.gpx tracks
// ogr2ogr - f GeoJSON day3.json day3.gpx tracks
// ogr2ogr - f GeoJSON day4.json day4.gpx tracks


// start = 2015090518, stop = 2015090605
// start = 2015090616, stop = 2015090704
// start = 2015090716, stop = 2015090805
// start = 2015090815, stop = 2015090907

//  * > pictures.json
