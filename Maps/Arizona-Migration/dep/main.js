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

const vehiclularheight = 2000
const pedestrianheight = 6000
const vehicularcolor = '#a88177'
const pedestriancolor = '#b32704'
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
// Trump Border
function trumpbordergrow(timefilteredto,section){
  return  section == 'Yuma' ? Math.min((Math.max(timefilteredto,(2019*12+5))-(2019*12+5))/19,1)*pedestrianheight*2 :
          section == 'Tuscon' ? Math.min((Math.max(timefilteredto,(2019*12+8))-(2019*12+8))/13,1)*pedestrianheight*2 : console.log('error')
};
// Filters Border Patrol Stations
function makeBPSfilter(timefilteredto){
  var filter = ['case',["in",'legacy',["get","Built"]],0.7]
  const constructionyears = [2007,2009,2011,2012]
  constructionyears.forEach(function (item, index) {
    filter.push(["in",item.toString(),["get","Built"]])
    filter.push(Math.min((Math.max(timefilteredto,(item-1)*12)-(item-1)*12)/12,1)*0.7)
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
    let initialr = 12
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
  timefilteredto > 2007*12 ? map.setLayoutProperty('newwalls','visibility','visible') : map.setLayoutProperty('newwalls','visibility','none');
  timefilteredto > 2019*12+5 ? map.setLayoutProperty('trumpwall-yuma','visibility','visible') : map.setLayoutProperty('trumpwall-yuma','visibility','none');
  timefilteredto > 2019*12+8 ? map.setLayoutProperty('trumpwall-tuscon','visibility','visible') : map.setLayoutProperty('trumpwall-tuscon','visibility','none');
  map.setPaintProperty(
    'newwalls',
    'fill-extrusion-height',
     bordergrow(timefilteredto)
  );
  map.setPaintProperty(
    'trumpwall-tuscon',
    'fill-extrusion-height',
     trumpbordergrow(timefilteredto,'Tuscon')
  );
  map.setPaintProperty(
    'trumpwall-yuma',
    'fill-extrusion-height',
     trumpbordergrow(timefilteredto,'Yuma')
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
zoom: 3,
center:[-96.1318693,39.3308844],
pitch: 0,
bearing: 0,
style: 'mapbox://styles/kazuton/ckq0jillz0etp17o03c6k03d0',
});

map.on('flystart', function(){
    flying = true;
    //console.log('flystart')
    map.dragPan.disable();
    map.scrollZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.dragRotate.disable();
    map.dragPan.disable();
    map.touchPitch.disable();
    map.touchZoomRotate.disable();
});
map.on('flyend', function(){
    flying = false;
    //console.log('flyend')
    map.dragPan.enable();
    map.scrollZoom.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.dragRotate.enable();
    map.dragPan.enable();
    map.touchPitch.enable();
    map.touchZoomRotate.enable();

});


//Border Patrol Station Icon
map.loadImage('icons/BP.png', function(error, image) {
//map.loadImage('BPS.png', function(error, image) {
if (error) throw error;
if (!map.hasImage('BPS')) map.addImage('BPS', image);
});

var opacity
function fadein(elementid){
  document.getElementById(elementid).style.display='inline'
  opacity = 0.1
  var opacityup = setInterval(function(){
    document.getElementById(elementid).style.opacity=opacity
    opacity ==1 ? clearInterval(opacityup) : opacity+= 0.1
  },50)
}
map.on('load', function () {
  setTimeout(function(){
    map.fire('flystart');
    map.flyTo({
      center: [-111.858, 32.302],
      zoom: 7.44,
      speed: 0.4,
      bearing:-162.3,
      pitch:47,
      curve: 1,
      easing(t) {
      return t;
    }})
    map.on('moveend', function(e){
       if(flying){
          loadlayers()
          //console.log('movedexec')
          map.fire('flyend');
          fadein('welcomeblur')

       }
    });
  },1500)
});

function loadlayers(){
	map.addSource('migrantdeaths', {
		type: 'geojson',
		// Use a URL for the value for the `data` property.
		data: "geojson/arizona.geojson"
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
		data: "geojson/roads.geojson"
	});
  map.addSource('borderwall', {
    type: 'geojson',
    data: "geojson/Border.geojson"
  });
  map.addSource('borderpatrol', {
    type: 'geojson',
    data: "geojson/BorderPatrol.geojson"
  });
  map.addSource('legacywall', {
    type: 'geojson',
    data: "geojson/legacywalls.geojson"
  });
  map.addSource('newwall', {
    type: 'geojson',
    data: "geojson/newwalls.geojson"
  });
  map.addSource('trumpwall', {
    type: 'geojson',
    data: "geojson/TrumpWall.geojson"
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
      'fill-extrusion-height':["case", ["in",'vehicle',["get","gen_type"]],vehiclularheight,["in",'pedestrian',["get","gen_type"]],pedestrianheight,0],
      'fill-extrusion-color': ["case", ["in",'vehicle',["get","gen_type"]],vehicularcolor,["in",'pedestrian',["get","gen_type"]],pedestriancolor,'black'],
    }
  });
  map.addLayer({
    'id': 'trumpwall-tuscon',
    'source': 'trumpwall',
    'type': 'fill-extrusion',
    'filter': ["in","Tucson",["get","Section"]],
    'paint': {
      'fill-extrusion-opacity': wallopacity,
      'fill-extrusion-color': pedestriancolor,
    }
  });
  map.addLayer({
    'id': 'trumpwall-yuma',
    'source': 'trumpwall',
    'type': 'fill-extrusion',
    'filter': ["in","Yuma (Wellton Station)",["get","Section"]],
    'paint': {
      'fill-extrusion-opacity': wallopacity,
      'fill-extrusion-color': pedestriancolor,
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
      'text-radial-offset':1,
      "text-size": {"stops": [[0, 0],[8, 0],[10.49,0],[10.5, 15],[16, 20]]}},
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
        0,'rgba(5, 29, 99,0)',
        0.1,'rgba(5, 29, 99,0.3)',
        1,'rgba(229, 229, 190,1)'],
      'heatmap-radius': {"base": 2,"stops": [[4,4],[13,1024]]},  // Adjust the heatmap radius by zoom level
      'heatmap-opacity': ['interpolate',['linear'],['zoom'],7,1,13,0] // Transition from heatmap to circle layer by zoom level
    },
    'layout':{'visibility':'none'}
  });
  map.addLayer({
    'id': 'bpstation',
    'source': 'borderpatrol',
    'type': 'symbol',
    'layout': {
      'icon-image': 'BPS',
      'icon-size': 0.03,
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'text-field':"{Name}",
      'text-anchor':'left',
      'text-radial-offset':1,
      "text-size": {"stops": [[0, 0],[8, 0],[9.99,0],[10, 20],[16, 30]]},

    },
    'paint':{
      'text-color':'#6b1e00',
      'text-opacity':0,

    }
  });
  map.setPaintProperty(
    'bpstation',
    'icon-opacity',
     makeBPSfilter(timefilteredto)
  );
}


var button = document.getElementById('exitbutton');
var popup = new mapboxgl.Popup()
function makepopup(lat,lng){
  popup = new mapboxgl.Popup()
    .setLngLat([lng,lat])
    .setHTML('<div ><h4>New Station</h4></div>')
    .addTo(map);
}
function getpopup(d) {
      return 	d > 2014*12 ? popup.remove():
              d > 2012*12 ? makepopup(32.37945, -112.87235) :
              d > 2011*12 ? makepopup(32.083644, -111.295838) :
              d > 2009*12 ? makepopup(32.248787, -109.824755) :
              d > 2007*12 ? makepopup(32.6543536, -114.632853) :
                           popup.remove() ;
};

mySlider.noUiSlider.on('slide',function(){
  popup.remove()
  getpopup(timefilteredto)
})

button.addEventListener('click', function(){
  fadein('legend')
  fadein('infobutton')
  document.getElementById('datediv').style.display = 'block'
  map.setLayoutProperty('death-heatmap','visibility','visible')
  button.style.display = 'none'
  var initseqid = setInterval(function(){
    var duration = 12
    if(timefilteredto < monthmax){
      timefilteredto += 1
      updatemap(timefilteredto)
      popup.remove()
      getpopup(timefilteredto)
    } else{
      initseqdone = true
      mySlider.style.display = 'block'
      clearInterval(initseqid)
      mySlider.noUiSlider.set(monthmax)
        map.setLayoutProperty('Names of Victims','visibility','visible');
        map.setPaintProperty('bpstation','text-opacity',0.7);
    };
},100);
console.log('clicked!')
})

map.on('idle', function () {
  if (initseqdone = true){
    mySlider.noUiSlider.on('update', function (e) {
      timefilteredto = parseInt(mySlider.noUiSlider.get())
      updatemap(timefilteredto);
      map.setFilter('Names of Victims',makefilter(timefilteredto));
    });
  }
});
