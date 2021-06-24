var monthmin = 1980*12;
var monthmax = 2020*12+5;
var mySlider = document.getElementById('slider');
mySlider.min = monthmin;
mySlider.value = monthmin;
mySlider.max = monthmax;
var timefilteredto = monthmin;
document.getElementById('date').innerText = moment(retrievedate(timefilteredto)).format('MMM, YYYY');


function retrievedate(months){
  let mon = 1+(months)%12;
  let year = (months-mon+1)/12;
  return year.toString()+'-'+mon.toString().padStart(2,'0');
};


mapboxgl.accessToken = 'pk.eyJ1Ijoia2F6dXRvbiIsImEiOiJja3Bhd2RpMGQwdDE1MnFvMXJwbmhnMmoxIn0.elQ7_sz1l4YQk3KVYjJz9Q';


var map = new mapboxgl.Map({
container: 'map',
zoom: 6.73,
center: [-111.332,32.948,],
pitch: 40,
bearing: 0,
style: 'mapbox://styles/kazuton/ckq0jillz0etp17o03c6k03d0'
});

map.on('load', function () {
  map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
	map.addSource('migrantdeaths', {
		type: 'geojson',
		// Use a URL for the value for the `data` property.
		data: "https://kazuto-nishimori.github.io/Portfolio/Maps/Arizona-Migration/arizona.geojson"
	});

	map.addLayer({
		'id': 'migrant-deaths',
    'source': 'migrantdeaths',
		'type': 'circle','paint': {'circle-color': "red"}
    //'type':'symbol', 'layout': {'icon-image': 'pulsing-dot', 'icon-allow-overlap': true}
    , filter: ["in", "1980-01",['get', "Reporting Date"]]

	});

  document
  .getElementById('slider')
  .addEventListener('input', function (e) {
    document
    .getElementById('date').innerText = moment(retrievedate(e.target.value)).format('MMM, YYYY');
    timefilteredto = e.target.value;
    var filter = ['any'];
    let month = e.target.value%12
    let year = (e.target.value-month)/12;
    for(var i = monthmin/12; i <  year; i++) {
        var filtercondition = ["in",i.toString(),['get', "Reporting Date"]]
        filter.push(filtercondition);
    };
    for(var i = year*12; i <= e.target.value; i++) {
        var filtercondition = ["in",retrievedate(i),['get', "Reporting Date"]]
        filter.push(filtercondition);
    };
    console.log(filter);
    map.setFilter('migrant-deaths',filter);
  });

});
