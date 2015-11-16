/Users/grady/Applications/GPSBabelFE.app/Contents/MacOS/gpsbabel 


gpsbabel -t -i gpx -f Banff.gpx -x track,pack,start=2015090518,stop=2015090605 -o gpx -F day1.gpx
gpsbabel -t -i gpx -f Banff.gpx -x track,pack,start=2015090616,stop=2015090704 -o gpx -F day2.gpx
gpsbabel -t -i gpx -f Banff.gpx -x track,pack,start=2015090716,stop=2015090805 -o gpx -F day3.gpx
gpsbabel -t -i gpx -f Banff.gpx -x track,pack,start=2015090815,stop=2015090907 -o gpx -F day4.gpx

ogr2ogr -f GeoJSON all.json Banff.gpx tracks
ogr2ogr -f GeoJSON day1.json day1.gpx tracks
ogr2ogr -f GeoJSON day2.json day2.gpx tracks
ogr2ogr -f GeoJSON day3.json day3.gpx tracks
ogr2ogr -f GeoJSON day4.json day4.gpx tracks


start=2015090518,stop=2015090605
start=2015090616,stop=2015090704
start=2015090716,stop=2015090805
start=2015090815,stop=2015090907