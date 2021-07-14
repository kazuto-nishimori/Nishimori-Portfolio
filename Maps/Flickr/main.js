//import vectorTileLayer from 'leaflet-vector-tile-layer';
var L = require('leaflet')
var $ = require('jquery')
import vectorTileLayer from 'leaflet-vector-tile-layer';

var class1 = 1;
var class2 = 3;
var class3 = 20;
var class4 = 1000;
const maxpic = 31271;
const maplat = 35.728919;
const maplon = 139.616674;



var slider = document.getElementById('slider-color');
var input1 = document.getElementById('input1');
var input2 = document.getElementById('input2');
var input3 = document.getElementById('input3');
var input4 = document.getElementById('input4');
var inputs = [input1,input2,input3,input4];
var classif = [class1,class2,class3,class4];
document.getElementById("maxinput").innerHTML = " - " + maxpic.toString();

noUiSlider.create(slider, {
    start: [Math.log(class1), Math.log(class2), Math.log(class3), Math.log(class4)],
    connect: [true, true, true, true, true],
    range: {
        'min': [0],
        'max': [Math.log(maxpic)],
    }
});

slider.noUiSlider.on('update', function (values, handle) {
    inputs[handle].value = Math.round(Math.exp(values[handle]));
    classif[handle] = Math.round(Math.exp(values[handle]));
});
var connect = slider.querySelectorAll('.noUi-connect');
var classes = ['c-5-color', 'c-4-color', 'c-3-color', 'c-2-color', 'c-1-color'];


for (var i = 0; i < connect.length; i++) {
    connect[i].classList.add(classes[i]);
}

inputs.forEach(function (input, handle) {
    input.addEventListener('change', function () {
        slider.noUiSlider.setHandle(handle, Math.log(this.value));
        classif[handle] = parseInt(this.value);
    });

});

var mymap = L.map('mapid').setView([maplat,maplon], 20); // edit 3
var mbtkn = 'pk.eyJ1Ijoia2F6dXRvbiIsImEiOiJja3Bhd2RpMGQwdDE1MnFvMXJwbmhnMmoxIn0.elQ7_sz1l4YQk3KVYjJz9Q';

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token='+mbtkn, {
maxZoom: 18, // edit 3
minZoom: 12,

attribution: 'Cartography by Kazuto Nishimori, Popup created with the help of Nathan Wies. Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> and Flickr API ' +
'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
id: 'mapbox/streets-v11'
}).addTo(mymap);


/*
var config = {
  url: "https://api.mapbox.com/v4/kazuton.6qkj2a5d/{z}/{x}/{y}.mvt?access_token="+mbtkn,
  getIDForLayerFeature: function(feature) {
    return feature._id;
  },
  filter: function(feature, context) {
    if (feature.layer.name === 'FinalMergedTokyoHex-4v116p') {
      return true;
    }
    return false;
  },
  style: function (feature) {
    var style = {};

    var type = feature.type;
    switch (type) {
      case 1: //'Point'
        style.color = 'rgba(49,79,79,1)';
        style.radius = 5;
        style.selected = {
          color: 'rgba(255,255,0,0.5)',
          radius: 6
        };
        break;
      case 2: //'LineString'
        style.color = 'rgba(161,217,155,0.8)';
        style.size = 3;
        style.selected = {
          color: 'rgba(255,25,0,0.5)',
          size: 4
        };
        break;
      case 3: //'Polygon'
        style.color = 'rgba(149,139,255,0.4)';
        style.outline = {
          color: 'rgb(20,20,20)',
          size: 1
        };
        style.selected = {
          color: 'rgba(255,140,0,0.3)',
          outline: {
            color: 'rgba(255,140,0,1)',
            size: 2
          }
        };
        break;
    }
  },
};

var mvtSource = new L.TileLayer.MVTSource(config);
mymap.addLayer(mvtSource); */


//var tileIndex = geojsonvt(tokyohex);
//var features = tileIndex.getTile(z, x, y).features;

const url = 'https://api.mapbox.com/v4/kazuton.6qkj2a5d/{z}/{x}/{y}.mvt?access_token='+mbtkn;
const options = {

};

const layer= vectorTileLayer(url, options);

/*
var geojson = L.geoJson(features, {
    style: style,
  }).addTo(mymap);*/

// show an array of tile coordinates created so far
//console.log(tileIndex.tileCoords); // [{z: 0, x: 0, y: 0}, ...]

var geojson = layer.addTo(mymap)

function getColor(d) {
  return 	d > classif[3] ? document.styleSheets[document.styleSheets.length - 1].cssRules[0].style.background :
          d > classif[2] ? document.styleSheets[document.styleSheets.length - 1].cssRules[1].style.background :
          d > classif[1] ? document.styleSheets[document.styleSheets.length - 1].cssRules[2].style.background :
          d > classif[0] ? document.styleSheets[document.styleSheets.length - 1].cssRules[3].style.background :
                       document.styleSheets[document.styleSheets.length - 1].cssRules[4].style.background;
};


function style(feature) {
  return {
        fillColor: getColor(feature.properties.pic),
        weight: 0.5,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.5
  };
  }

function updateMap() {
    geojson.eachLayer(function(layer){
    layer.setStyle(style(layer.feature));
  });
    document.getElementById("dyninput1").innerHTML = " - " + classif[0].toString();
    document.getElementById("dyninput2").innerHTML = " - " + classif[1].toString();
    document.getElementById("dyninput3").innerHTML = " - " + classif[2].toString();
    document.getElementById("dyninput4").innerHTML = " - " + classif[3].toString();
  };

inputs.forEach(function (input, handle) {
      input.addEventListener('change', updateMap)});

slider.noUiSlider.on('update', updateMap);

var mapControlsContainer = document.getElementsByClassName("leaflet-control")[0];
var logoContainer = document.getElementById("logoContainer");

mapControlsContainer.appendChild(logoContainer);

var div = L.DomUtil.get('logoContainer'); // this must be an ID, not class!
L.DomEvent.on(div, 'mousewheel', L.DomEvent.stopPropagation);
L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation);



var lat, lon;
      var apiurl, picurl, address;
      var rad = 0.05; // edit 4
      var num = 20.0; // number of photos in pop up

      var Icon1 = L.icon({
    iconUrl: 'target.png',
    iconSize:     [30, 30], // size of the icon
    iconAnchor:   [15, 15], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
});

      var mymarker = L.marker(
                  [0, 0],
                  {icon: Icon1}
          ).addTo(mymap);

      var arr = ['<div class = "popup">']

      //this function is called when the user clicks the map
      mymap.on("click", function(e){
          // in order to force the order in which the methods are run
          // we use a technique called callbacks, which calls methods
          // in an order such that they only run when we want

          // gets street address from passed lat lon values

          function getAddress(other){
          $.get('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+ e.latlng.lat.toString(10) +'&lon='+e.latlng.lng.toString(10), function(data){
              address = data.address;
          });
          other(makeMarker);
          }

          // pulls the actual flickr data nearby the point
          function doJson(other){
          $.getJSON("https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=ca370d51a054836007519a00ff4ce59e&page&per_page="+num.toString(10)+"&format=json&nojsoncallback=1&privacy_filter=1& accuracy=16&lat="+e.latlng.lat.toString(10)+"&lon="+e.latlng.lng.toString(10)+"&radius="+rad.toString(10),function(json){
              if(parseInt(json.photos.total)>0){

              $.each(json.photos.photo,function(i,result){
              picurl = "https://farm"+result.farm +".staticflickr.com/"+result.server +"/"+result.id+"_"+ result.secret+".jpg";
              arr.push('<img src="'+picurl+'"/><br><p>'+result.title+'</p><br><br>');
              })

              /*arr.push("<h3>Total Pictures Found: "+json.photos.total.toString(10)+" at a radius of "+ rad.toString(10) +" km</h3><p><h5>Location:</h5> " + address.road + "," +address.city+ "<h5>, </h5>"+ address.country +"<br> Postcode: "+ address.postcode + "<br> Country: " + address.country +"</p><p><h5>Coordinates</h5>Latitude: " + e.latlng.lat.toString(10) + "<br>Longitude: " + e.latlng.lng.toString(10) + "</p><p>Displaying a maximum of " +num.toString(10)+ " pictures</p>");
    */
    arr.push("<center><h2>***</h2></center><h2>Displaying " +Math.min(num, json.photos.total).toString(10)+" out of the "+json.photos.total.toString(10)+" total photos found on Flickr within a "+ rad.toString(10)*1000 +"m radius of this point</h2><p>Location: <a href='https://www.google.com/maps/@?api=1&map_action=pano&viewpoint="+e.latlng.lat.toString(10)+"&comma;"+e.latlng.lng.toString(10)+"&heading=-45&pitch=0&fov=80' target='_blank'>"+address.road+"&comma; "+address.city+"&comma; "+address.country+"&comma; "+address.postcode+"<a></p>");
              }
              else{
                  arr.push('<p>No photograph is available to the public within a '+ rad.toString(10)*1000 +'m radius of this point</p></p>')
              }
              other();
          })}

          // makes the marker with all of the info passed in the getJson function
          function makeMarker(){
              arr.push("<div>")
              let scrolltotop = '<h1>lala</h1>'
              var allpics = arr.toString();
              allpics = scrolltotop.concat(allpics)
              allpics = allpics.replace(/,/g, "");
              console.log(allpics)
              mymarker.bindPopup(allpics).openPopup().setOpacity(0);
              document.getElementById('popup-cont').scrollIntoView();
              picurl = ""
              arr = ['<div class = "popup">']

          }
          getAddress(doJson);
      })
