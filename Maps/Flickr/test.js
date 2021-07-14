//Code by Kazuto Nishimori, 2021
//inquire at kazuto.nishimori@gmail.com
//some code borrowed from https://docs.mapbox.com/mapbox-gl-js/example/toggle-layers/

//var monthmin = 2000*12; //date in numeric form, converted to number of months after year 0
//var monthmax = 2020*12+5;
//var mySlider = document.getElementById('slider');
//mySlider.min = monthmin;
//mySlider.value = monthmin;
//mySlider.max = monthmax;
var timefilteredto = monthmin; //the date (numeric) upto which the data is filtered
document.getElementById('date').innerText = moment(retrievedate(timefilteredto)).format('YYYY MMM');

var initseqdone = new Boolean("false")
mySlider.style.display = 'none'
const datecolumn = "Reporting Date"

const vehiclularheight = 1000
const pedestrianheight = 5000
const vehicularcolor = '#D17058'
const pedestriancolor = '#D14926'
const wallopacity = 0.7




//########## Utility functions ##########
// convert numeric date to the form "1980-02"
function retrievedate(months){
  let mon = 1+(months)%12;
  let year = (months-mon+1)/12;
  return year.toString()+'-'+mon.toString().padStart(2,'0');
};
// a quadratic decay function from (0,yint) to (xint,0). Returns y
function decayfunc(xint,yint,x){
  return yint*(1-Math.pow((x/xint),2))
};
// lin function from (0,yint) to (xint,0). Returns y
function linfunc(xint,yint,x){
  return (-yint/xint)*x + yint
};


//########## Filter functions ##########
// returns JSON filter all data on or before 'timefilteredto'
function makefilter(timefilteredto){
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
//returns JSON filter for data found within 'duration'time from 'timefilteredto'
function makedurationfilter(timefilteredto, duration){
  var filter = ['any'];
  for (var i = 0; i < duration; i++){
    var filtercondition = ["in",retrievedate(timefilteredto - i ),['get', "Reporting Date"]]
    filter.push(filtercondition)
  }
  return filter
};
//Opacity filter for border file
/*function makeborderfilter(timefilteredto){
  var filter = ['case',["in",'legacy',["get","project"]],1,["!",["in",'legacy',["get","project"]]]]
  filter.push(Math.min((Math.max(timefilteredto,2007*12)-2007*12)/12,1))
  filter.push(0)
  return filter
};*/
// Returns border wall height
function bordergrow(timefilteredto){
  var filter = ["case", ["in",'vehicle',["get","gen_type"]]]
  filter.push(Math.min((Math.max(timefilteredto,2007*12)-2007*12)/12,1)*vehiclularheight)
  filter.push(["in",'pedestrian',["get","gen_type"]])
  filter.push(Math.min((Math.max(timefilteredto,2007*12)-2007*12)/12,1)*pedestrianheight)
  filter.push(0)
  return filter
};
// Filters Border Patrol Stations
function makeBPSfilter(timefilteredto){
  var filter = ['case',["in",'legacy',["get","Built"]],1]
  const constructionyears = [2007,2009,2011,2012]
  constructionyears.forEach(function (item, index) {
    filter.push(["in",item.toString(),["get","Built"]])
    filter.push(Math.min((Math.max(timefilteredto,(item-1)*12)-(item-1)*12)/12,1))
  });
  filter.push(0)
  return filter
};
// returns JSON paint filter. Duration is for any decay, change
function makepaintfilter(timefilteredto, option, duration){
  let filter = ['case'];
  if(option == 'opacity'){      //filter for opacity decay
    for(var i = 0; i <  duration; i++) {
      filter.push(["in",retrievedate(timefilteredto - i),['get',datecolumn]]);
      filter.push(decayfunc(duration,1,i));
    };
    filter.push(1)
  };
  if(option == 'size'){         //filter for text size decay
    for(var i = 0; i <  duration; i++) {
      const radius = 15;
      filter.push(["in",retrievedate(timefilteredto - i),['get',datecolumn]]);
      filter.push(decayfunc(duration,radius,i))
    };
    filter.push(0)
  };
  if(option == 'radius'){         //filter for circle radius decay
    let initialr = 8
    let finalr = 2
    for(var i = 0; i <  duration; i++) {
      filter.push(["in",retrievedate(timefilteredto - i),['get',datecolumn]]);
      filter.push(decayfunc(duration,initialr,i)+finalr)
    };
    filter.push(finalr)
  };
  if(option == 'color'){         //filter for color change from white to target color
    var initr = 255
    var initg = 0
    var initb = 0
    var targetr = 255
    var targetg = 255
    var targetb = 255
    for(var i = 0; i <  (duration-1); i++) {
      filter.push(["in",retrievedate((timefilteredto+1) - i),['get',datecolumn]]);
      let r = Math.floor(initr + (targetr-initr)*(i/(duration-1)))
      let g = Math.floor(initg + (targetg-initg)*(i/(duration-1)))
      let b = Math.floor(initb + (targetb-initb)*(i/(duration-1)))
      filter.push(("rgb(").concat(r.toString(),",",g.toString(),",", b.toString(), ")"))
    };
    filter.push(("rgb(").concat(targetr.toString(),",",targetg.toString(),",", targetb.toString(), ")"))
  };
  if(option == 'heatmap'){         //filter for circle radius decay
    for(var i = 0; i <  duration; i++) {
      filter.push(["in",retrievedate(timefilteredto - i),['get',datecolumn]]);
      filter.push(linfunc(duration,1,i))
    };
    filter.push(0)
    //console.log(1)
  };
  return filter
};


//########## Map Update Function ##########
//Runs after every iteration of timefilteredto
function updatemap(timefilteredto){
  document.getElementById('date').innerText = moment(retrievedate(timefilteredto)).format('YYYY, MMM');
  map.setFilter('death-circle',makefilter(timefilteredto));
  map.setFilter('death-heatmap',makedurationfilter(timefilteredto, 24));
  map.setPaintProperty(
    'death-circle',
    'circle-radius',
    makepaintfilter(timefilteredto, 'radius', 24)
  );
  // map.setPaintProperty('death-circle','circle-radius',makepaintfilter(timefilteredto, 'radius', 12));
  map.setPaintProperty(
    'death-heatmap',
    'heatmap-weight',
    makepaintfilter(timefilteredto, 'heatmap', 24)
  );
  if(timefilteredto>2007*12){
    map.setLayoutProperty(
      'newwalls',
      'visibility',
       'visible'
    );
  }else{
    map.setLayoutProperty(
      'newwalls',
      'visibility',
       'none'
    );
  }
  map.setPaintProperty(
    'newwalls',
    'fill-extrusion-height',
     bordergrow(timefilteredto)
  );
  map.setPaintProperty(
    'bpstation',
    'icon-opacity',
     makeBPSfilter(timefilteredto)
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

//Border Patrol Station Icon
map.loadImage('https://kazuto-nishimori.github.io/Portfolio/Maps/Arizona-Migration/BPS3.png', function(error, image) {
//map.loadImage('BPS.png', function(error, image) {
if (error) throw error;
if (!map.hasImage('BPS')) map.addImage('BPS', image);
});


map.on('load', function () {
  map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
	map.addSource('migrantdeaths', {
		type: 'geojson',
		// Use a URL for the value for the `data` property.
		data: "https://kazuto-nishimori.github.io/Portfolio/Maps/Arizona-Migration/arizona.geojson"
	});
  // Dot representing each victim
	map.addLayer({
		'id': 'death-circle',
    'source': 'migrantdeaths',
    'filter': ['all',['has', 'Post Mortem Interval'],['!',["in",'6-8 months',['get','Post Mortem Interval']]]],
		'type': 'circle',
    'paint': {
      //'circle-radius' : {"stops": [[0, 0],[8, 0],[10, 2],[16, 5]]},
      'circle-opacity':{"stops": [[0, 0],[10, 0],[11, 0.5],[13, 1]]},
      'circle-color':"white"}
    //'type':'symbol', 'layout': {'icon-image': 'pulsing-dot', 'icon-allow-overlap': true}
    //, filter: ["in", "2020",['get', "Reporting Date"]]
	});
  map.addSource('roads', {
		type: 'geojson',
		// Use a URL for the value for the `data` property.
		data: "https://kazuto-nishimori.github.io/Portfolio/Maps/Arizona-Migration/roads.geojson"
	});
  map.addSource('borderwall', {
    type: 'geojson',
    data: "https://kazuto-nishimori.github.io/Portfolio/Maps/Arizona-Migration/Border.geojson"
  });
  map.addSource('borderpatrol', {
    type: 'geojson',
    data: "https://kazuto-nishimori.github.io/Portfolio/Maps/Arizona-Migration/BorderPatrol.geojson"
  });
  map.addSource('legacywall', {
    type: 'geojson',
    data: "https://kazuto-nishimori.github.io/Portfolio/Maps/Arizona-Migration/legacywalls.geojson"
  });
  map.addSource('newwall', {
    type: 'geojson',
    data: "https://kazuto-nishimori.github.io/Portfolio/Maps/Arizona-Migration/newwalls.geojson"
  });

  map.addLayer({
		'id': 'arizonaroads',
    'source': 'roads',
		'type': 'line','paint': {'line-width' : 1, 'line-opacity':0.7, 'line-color':"#8bb259"}
	});

/*  map.addLayer({
		'id': 'border',
    'source': 'borderwall',
		'type': 'line',
    'paint': {
      'line-width' : ["case", ["in",'vehicle',["get","gen_type"]],5,["in",'pedestrian',["get","gen_type"]],10,0],
      'line-color':["case", ["in",'vehicle',["get","gen_type"]],'#B34529',["in",'pedestrian',["get","gen_type"]],'#661F0D','black']
    }
	}); */

  map.addLayer({
    'id': 'bpstation',
    'source': 'borderpatrol',
    'type': 'symbol',
    'layout': {
      'icon-image': 'BPS',
      'icon-size': 0.03,
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    }
  });
  map.setPaintProperty(
    'bpstation',
    'icon-opacity',
     makeBPSfilter(timefilteredto)
  );

  map.addLayer({
    'id': 'newwalls',
    'source': 'newwall',
    'type': 'fill-extrusion',
    'paint': {
      'fill-extrusion-opacity':wallopacity,
      'fill-extrusion-color':["case", ["in",'vehicle',["get","gen_type"]],vehicularcolor,["in",'pedestrian',["get","gen_type"]],pedestriancolor,'black'],
    }
  });
  map.addLayer({
    'id': 'legacywalls',
    'source': 'legacywall',
    'type': 'fill-extrusion',
    'paint': {
      'fill-extrusion-opacity':wallopacity,
      'fill-extrusion-height': ["case", ["in",'vehicle',["get","gen_type"]],vehiclularheight,["in",'pedestrian',["get","gen_type"]],pedestrianheight,0],
      'fill-extrusion-color': ["case", ["in",'vehicle',["get","gen_type"]],vehicularcolor,["in",'pedestrian',["get","gen_type"]],pedestriancolor,'black'],
    }
  });

let labelfont = ['literal',['Open Sans Regular', 'Arial Unicode MS Regular']];
  map.addLayer({
		'id': 'Names of Victims',
    'filter':['all',['has', 'Post Mortem Interval'],['!',["in",'6-8 months',['get','Post Mortem Interval']]]],
    'source': 'migrantdeaths',
		'type': 'symbol',
    'layout': {
      'text-field': "{NameAge}",
      'text-font': labelfont,
      'text-anchor':'bottom',
      'text-allow-overlap': false,
      "text-size": {"stops": [[0, 0],[8, 0],[11.99,0],[12, 10],[16, 20]]}},
    'paint':{'text-color':'white','text-opacity':0.7}
    //'type':'symbol', 'layout': {'icon-image': 'pulsing-dot', 'icon-allow-overlap': true}
    //, filter: ["in", "2020",['get', "Reporting Date"]]
	});
  map.addLayer({
    'id': 'death-heatmap',
    'type': 'heatmap',
    'source': 'migrantdeaths',
    'paint': {
      //'heatmap-weight': 0.5,
      // Increase the heatmap color weight weight by zoom level
      // heatmap-intensity is a multiplier on top of heatmap-weight
      //'heatmap-intensity': ['interpolate',['linear'],['zoom'],0,1,18,3],
      // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
      // Begin color ramp at 0-stop with a 0-transparancy color
      // to create a blur-like effect.
      'heatmap-color': ['interpolate',['linear'],['heatmap-density'],
        0,'rgba(0, 57, 115,0)',
        0.1,'rgba(3, 85, 168,0.3)',
        1,'rgba(229, 229, 190,1)'],
      'heatmap-radius': {"base": 2,"stops": [[4,4],[13,1024]]},  // Adjust the heatmap radius by zoom level
      'heatmap-opacity': ['interpolate',['linear'],['zoom'],7,1,13,0] // Transition from heatmap to circle layer by zoom level
    }//map.setPaintProperty('death-heatmap','heatmap-radius',{"base": 2,"stops": [[4,2],[13,512]]})
  });

  map.setLayoutProperty('Names of Victims','visibility','none');

    var initseqid = setInterval(function(){
      var duration = 12
      if(timefilteredto < monthmax){
        timefilteredto += 1
        updatemap(timefilteredto)
      } else{
        initseqdone = true
        mySlider.style.display = 'block'
        clearInterval(initseqid)
        mySlider.noUiSlider.set(monthmax)
        map.setLayoutProperty('Names of Victims','visibility','visible');
      };
    },10);
});

map.on('idle', function () {
  if (initseqdone = true){
    mySlider.noUiSlider.on('update', function (e) {
      timefilteredto = parseInt(mySlider.noUiSlider.get())
      updatemap(timefilteredto);
      map.setFilter('Names of Victims',makefilter(timefilteredto));
    });
  }

  if (map.getLayer('Names of Victims') && map.getLayer('death-heatmap')) {
  // Enumerate ids of the layers.
    var toggleableLayerIds = ['Names of Victims','death-heatmap'];
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
