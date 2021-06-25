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
		'id': 'death-circle',
    'source': 'migrantdeaths',
		'type': 'circle','paint': {'circle-color': "red", 'circle-radius' : 2}
    //'type':'symbol', 'layout': {'icon-image': 'pulsing-dot', 'icon-allow-overlap': true}
    //, filter: ["in", "2020",['get', "Reporting Date"]]
	});

let labelfont = ['literal',['Open Sans Regular', 'Arial Unicode MS Regular']];
  map.addLayer({
		'id': 'names-of-diseased',
    'source': 'migrantdeaths',
		'type': 'symbol',
    'layout': {'text-field': "{NameAge}",'text-font': labelfont, 'text-anchor':'bottom','text-allow-overlap': false},
    'paint':{'text-color':'#B04141'}
    //'type':'symbol', 'layout': {'icon-image': 'pulsing-dot', 'icon-allow-overlap': true}
    //, filter: ["in", "2020",['get', "Reporting Date"]]
	});



  function makefilter(timefilteredto){
    var filter = ['any'];
    let month = timefilteredto%12
    let year = (timefilteredto-month)/12;
    for(var i = monthmin/12; i <  year; i++) {
        var filtercondition = ["in",i.toString(),['get', "Reporting Date"]]
        filter.push(filtercondition);
    };
    for(var i = year*12; i <= timefilteredto; i++) {
        var filtercondition = ["in",retrievedate(i),['get', "Reporting Date"]]
        filter.push(filtercondition);
    };
    return filter
  };

  function decayfunc(xint,yint,x){
    return yint*(1-Math.pow((x/xint),2))
  };

  function makepaintfilter(timefilteredto, option, duration){
    let filter = ['case'];
    const radius = 15;
    if(option == 'opacity'){
      for(var i = 1; i <  duration; i++) {
        filter.push(["in",retrievedate(timefilteredto - i),['get',"Reporting Date"]]);
        filter.push(decayfunc(duration,1,i));
      };
      filter.push(1)
    };
    if(option == 'radius'){
      for(var i = 1; i <  duration; i++) {
        filter.push(["in",retrievedate(timefilteredto - i),['get',"Reporting Date"]]);
        filter.push(decayfunc(duration,radius,i))
      };
      filter.push(0)
    };
    if(option == 'color'){
      var targetr = 108
      var targetg = 3
      var targetb = 228
      for(var i = 0; i <  (duration-1); i++) {
        //filter.push(["in",retrievedate(timefilteredto - i),['get',"Reporting Date"]]);
        let r = Math.floor(255 + (targetr-255)*(i/(duration-1)))
        let g = Math.floor(255 + (targetg-255)*(i/(duration-1)))
        let b = Math.floor(255 + (targetb-255)*(i/(duration-1)))
        filter.push(("rgb(").concat(r.toString(),",",g.toString(),",", b.toString(), ")"))
      };
      filter.push(("rgb(").concat(targetr.toString(),",",targetg.toString(),",", targetb.toString(), ")"))
    };
    return filter
  };

  document
  .getElementById('slider')
  .addEventListener('input', function (e) {
    document.getElementById('date').innerText = moment(retrievedate(e.target.value)).format('MMM, YYYY');
    timefilteredto = e.target.value;
    map.setFilter('death-circle',makefilter(timefilteredto));
    map.setFilter('names-of-diseased',makefilter(timefilteredto));
    map.setPaintProperty(
      'death-circle',
      'circle-color',
      makepaintfilter(timefilteredto, 'color', 12)
    );
    map.setLayoutProperty(
      'names-of-diseased',
      'text-size',
      makepaintfilter(timefilteredto, 'radius', 12)
    );

  });
});
