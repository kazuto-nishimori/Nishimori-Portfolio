//Code by Kazuto Nishimori, 2021
//inquire at kazuto.nishimori@gmail.com
//some code borrowed from https://docs.mapbox.com/mapbox-gl-js/example/toggle-layers/

var monthmin = 1980*12; //date in numeric form, converted to number of months after year 0
var monthmax = 2020*12+5;
var mySlider = document.getElementById('slider');
mySlider.min = monthmin;
mySlider.value = monthmin;
mySlider.max = monthmax;
var timefilteredto = monthmin; //the date (numeric) upto which the data is filtered
document.getElementById('date').innerText = moment(retrievedate(timefilteredto)).format('MMM, YYYY');

var initseqdone = new Boolean("false")
mySlider.style.display = 'none'

const datecolumn = "Reporting Date"

function retrievedate(months){ // convert numeric date to the form "1980-02"
  let mon = 1+(months)%12;
  let year = (months-mon+1)/12;
  return year.toString()+'-'+mon.toString().padStart(2,'0');
};

function decayfunc(xint,yint,x){ // a quadratic decay function from (0,yint) to (xint,0). Returns y
  return yint*(1-Math.pow((x/xint),2))
};

function makefilter(timefilteredto){ // returns JSON filter for data with time stamps before timefilteredto inclusive
  var filter = ['any'];
  let month = timefilteredto%12
  let year = (timefilteredto-month)/12;                // e.g. if filter is filtering up to Feb, 1983, then
  for(var i = monthmin/12; i <  year; i++) {           // all previous years selected e.g. "1980","1981","1982"
      var filtercondition = ["in",i.toString(),['get', datecolumn]]
      filter.push(filtercondition);
  };
  for(var i = year*12; i <= timefilteredto; i++) {     // months of the last year selected e.g. "1983-01", "1983-02"
      var filtercondition = ["in",retrievedate(i),['get', datecolumn]]
      filter.push(filtercondition);
  };
  return filter
};

function makepaintfilter(timefilteredto, option, duration){ // returns JSON paint filter. Duration is for any decay, change
  let filter = ['case'];
  const radius = 15;
  if(option == 'opacity'){      //filter for opacity decay
    for(var i = 1; i <  duration; i++) {
      filter.push(["in",retrievedate(timefilteredto - i),['get',datecolumn]]);
      filter.push(decayfunc(duration,1,i));
    };
    filter.push(1)
  };
  if(option == 'size'){         //filter for text size decay
    for(var i = 1; i <  duration; i++) {
      filter.push(["in",retrievedate(timefilteredto - i),['get',datecolumn]]);
      filter.push(decayfunc(duration,radius,i))
    };
    filter.push(0)
  };
  if(option == 'radius'){         //filter for circle radius decay
    let initialr = 10
    let finalr = 2
    for(var i = 1; i <  duration; i++) {
      filter.push(["in",retrievedate(timefilteredto - i),['get',datecolumn]]);
      filter.push(decayfunc(duration,initialr,i)+finalr)
    };
    filter.push(finalr)
  };
  if(option == 'color'){         //filter for color change from white to target color
    var targetr = 0
    var targetg = 0
    var targetb = 0
    for(var i = 0; i <  (duration-1); i++) {
      filter.push(["in",retrievedate(timefilteredto - i),['get',datecolumn]]);
      let r = Math.floor(255 + (targetr-255)*(i/(duration-1)))
      let g = Math.floor(255 + (targetg-255)*(i/(duration-1)))
      let b = Math.floor(255 + (targetb-255)*(i/(duration-1)))
      filter.push(("rgb(").concat(r.toString(),",",g.toString(),",", b.toString(), ")"))
    };
    filter.push(("rgb(").concat(targetr.toString(),",",targetg.toString(),",", targetb.toString(), ")"))
  };
  return filter
};

function updatemap(timefilteredto){
  document.getElementById('date').innerText = moment(retrievedate(timefilteredto)).format('MMM, YYYY');
  map.setFilter('death-circle',makefilter(timefilteredto));
  map.setPaintProperty(
    'death-circle',
    'circle-color',
    makepaintfilter(timefilteredto, 'color', 12)
  );
  map.setPaintProperty(
    'death-circle',
    'circle-radius',
    makepaintfilter(timefilteredto, 'radius', 12)
  );
}


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
		'type': 'circle','paint': {'circle-color': "red", 'circle-radius' : 0, 'circle-opacity':0.7}
    //'type':'symbol', 'layout': {'icon-image': 'pulsing-dot', 'icon-allow-overlap': true}
    //, filter: ["in", "2020",['get', "Reporting Date"]]
	});

let labelfont = ['literal',['Open Sans Regular', 'Arial Unicode MS Regular']];
  map.addLayer({
		'id': 'Names of Victims',
    'source': 'migrantdeaths',
		'type': 'symbol',
    'layout': {
      'text-field': "{NameAge}",
      'text-font': labelfont,
      'text-anchor':'bottom',
      'text-allow-overlap': false,
      "text-size": {
            "stops": [
                [0, 0],
                [8, 0],
                [10, 10],
                [16, 20]
            ]}
        },
    'paint':{'text-color':'white'}
    //'type':'symbol', 'layout': {'icon-image': 'pulsing-dot', 'icon-allow-overlap': true}
    //, filter: ["in", "2020",['get', "Reporting Date"]]
	});
  map.setLayoutProperty(
    'Names of Victims',
    'visibility',
    'none'
  );

    var initseqid = setInterval(function(){
      var duration = 12
      if(timefilteredto < monthmax){
        timefilteredto += 1
        updatemap(timefilteredto)
      } else{
        initseqdone = true
        mySlider.style.display = 'block'
        clearInterval(initseqid)
        mySlider.value = monthmax
      };
    },10);
});

map.on('idle', function () {
  if (initseqdone = true){
    mySlider.addEventListener('input', function (e) {
      timefilteredto = mySlider.value
      updatemap(timefilteredto);
      map.setFilter('Names of Victims',makefilter(timefilteredto));
    });
  }

  if (map.getLayer('Names of Victims')) {
  // Enumerate ids of the layers.
    var toggleableLayerIds = ['Names of Victims'];
    // Set up the corresponding toggle button for each layer.
    for (var i = 0; i < toggleableLayerIds.length; i++) {
      var id = toggleableLayerIds[i];
      if (!document.getElementById(id)) {
      // Create a link.
        var link = document.createElement('a');
        link.id = id;
        link.href = '#';
        link.textContent = id;
        link.className = 'active';
        // Show or hide layer when the toggle is clicked.
        link.onclick = function (e) {
          var clickedLayer = this.textContent;
          e.preventDefault();
          e.stopPropagation();
          var visibility = map.getLayoutProperty(
          clickedLayer,
          'visibility'
          );
          // Toggle layer visibility by changing the layout object's visibility property.
          if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer,'visibility','none');
            this.className = '';
          } else {
            this.className = 'active';
            map.setFilter(clickedLayer,makefilter(timefilteredto));
            map.setLayoutProperty(clickedLayer,'visibility','visible');
          }
        };
        var layers = document.getElementById('menu');
        layers.appendChild(link);
      }
    }
  }
});
