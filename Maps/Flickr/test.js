var class1 = 2;
var class2 = 7;
var class3 = 57;
var class4 = 706;
var maxpic = 31271;
const maplat = 35.6672814;
const maplon = 139.7065616;
var slider = document.getElementById('slider-color');
var input1 = document.getElementById('input1');
var input2 = document.getElementById('input2');
var input3 = document.getElementById('input3');
var input4 = document.getElementById('input4');
var inputs = [input1,input2,input3,input4];
var classif = [class1,class2,class3,class4];
var flying = new Boolean
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
				    	var valuebefore = this.value;
				        slider.noUiSlider.setHandle(handle, Math.log(this.value));
				        this.value = valuebefore;
				        classif[handle] = parseInt(this.value);
				    });
});

function fadein(elementid){
  let opacity = 0.1
  document.getElementById(elementid).style.display='inline'
  var opacityup = setInterval(function(){
    document.getElementById(elementid).style.opacity=opacity
    opacity ==1 ? clearInterval(opacityup) : opacity+= 0.1
  },50)
}

function updateMap(){
  let filter = ['case']
  for(i=0;i<=3;i++){
    if(i != 3){
      filter.push(['all',[">", ['get','pic'], classif[i]],["<=", ['get','pic'], classif[i+1]]])
    }else{
      filter.push([">", ['get','pic'], classif[i]])
    }
    filter.push(document.styleSheets[document.styleSheets.length - 1].cssRules[i].style.background)
  }
  filter.push('white')
  map.setPaintProperty(
    'TokyoHex',
    'fill-color',
     filter
  );
  map.setPaintProperty(
    'TokyoHex',
    'fill-opacity',
     ['case',["<=", ['get','pic'], classif[0]],0,0.3]
  );
  map.setPaintProperty(
    'ManhHex',
    'fill-color',
     filter
  );
  map.setPaintProperty(
    'ManhHex',
    'fill-opacity',
     ['case',["<=", ['get','pic'], classif[0]],0,0.3]
  );
  document.getElementById("dyninput1").innerHTML = " - " + classif[0].toString();
  document.getElementById("dyninput2").innerHTML = " - " + classif[1].toString();
  document.getElementById("dyninput3").innerHTML = " - " + classif[2].toString();
  document.getElementById("dyninput4").innerHTML = " - " + classif[3].toString();
  document.getElementById("maxinput").innerHTML = " - " + maxpic.toString();

}

mapboxgl.accessToken = 'pk.eyJ1Ijoia2F6dXRvbiIsImEiOiJja3Bhd2RpMGQwdDE1MnFvMXJwbmhnMmoxIn0.elQ7_sz1l4YQk3KVYjJz9Q';
var map = new mapboxgl.Map({
container: 'mapid',
zoom: 14,
center: [maplon,maplat],
style: 'mapbox://styles/kazuton/ckr0wofx763sg17rvuxhhtlej',
hash:true,
});

var rad = 0.025; // edit 4
var num = 20.0;
var arr = ['<div class = "popup"><input autofocus style="display:none"><br>']
var address
var smallpopup=0

map.on('load', function () {
  	map.addSource('Theatmap', {
  		type: 'geojson',
  		data: "Tokyoheatmap.geojson"
  	});
    map.addSource('NYheatmap', {
  		type: 'geojson',
  		data: "NYCheatmap.geojson"
  	});
    map.addSource('Parisheatmap', {
  		type: 'geojson',
  		data: "Parisheatmap.geojson"
  	});
  map.addSource('Thex',{
    type:'vector',
    url:'mapbox://kazuton.6qkj2a5d'
  })
  map.addSource('Mhex',{
      type:'vector',
      url:'mapbox://kazuton.2id79ucf'
    })
  map.addSource('Phex',{
        type:'vector',
        url:'mapbox://kazuton.a3lj7eit'
    })
  map.addLayer({
		'id': 'TokyoHex',
    'source': 'Thex',
    'source-layer': 'FinalMergedTokyoHex-4v116p',
		'type': 'fill',
    'paint':{},
    'minzoom': 13,
	});
  map.addLayer({
		'id': 'ManhHex',
    'source': 'Mhex',
    'source-layer': 'FinalMergedNYCHex-c9np5a',
		'type': 'fill',
    'paint':{},
    'minzoom': 14,
	});
  map.addLayer({
		'id': 'ParisHex',
    'source': 'Phex',
    'source-layer': 'FinalMergedParisHex-cqo6fh',
		'type': 'fill',
    'paint':{},
    'minzoom': 14,
	});
  map.addLayer({
    'id': 'TokyoHeat',
    'source': 'Theatmap',
    'type': 'heatmap',
    'maxzoom':13,
    'paint': {
        // Increase the heatmap weight based on frequency and property magnitude
        'heatmap-weight': ['interpolate',['linear'],['get', 'pics'],0,0,177218,1],
        // Increase the heatmap color weight weight by zoom level
        // heatmap-intensity is a multiplier on top of heatmap-weight
        'heatmap-intensity': ['interpolate',['linear'],['zoom'],5,1,14,3],
        // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
        // Begin color ramp at 0-stop with a 0-transparancy color
        // to create a blur-like effect.
        'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,'rgba(236,213,244,0)',
        0.01,'rgba(236,213,244,1)',
        0.2,'#d5a3f7',
        0.4,'#c27af9',
        0.6,'#b45cfa',
        0.8,'#a943fb',
        1,'#a131fc'
        ],
        // Adjust the heatmap radius by zoom level
        'heatmap-radius': {"base": 2,"stops": [[7,4],[16,1024]]},
        'heatmap-opacity':0.5
      }
  });
  map.addLayer({
    'id': 'NYCHeat',
    'source': 'NYheatmap',
    'type': 'heatmap',
    'maxzoom':14,
    'paint': {
        // Increase the heatmap weight based on frequency and property magnitude
        'heatmap-weight': ['interpolate',['linear'],['get', 'pics'],0,0,72036,1],
        // Increase the heatmap color weight weight by zoom level
        // heatmap-intensity is a multiplier on top of heatmap-weight
        'heatmap-intensity': ['interpolate',['linear'],['zoom'],5,1,13,3],
        // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
        // Begin color ramp at 0-stop with a 0-transparancy color
        // to create a blur-like effect.
        'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,'rgba(236,213,244,0)',
        0.01,'rgba(236,213,244,1)',
        0.2,'#d5a3f7',
        0.4,'#c27af9',
        0.6,'#b45cfa',
        0.8,'#a943fb',
        1,'#a131fc'
        ],
        // Adjust the heatmap radius by zoom level
        'heatmap-radius': {"base": 2,"stops": [[9,4],[18,1024]]},
        'heatmap-opacity':0.5
      }
  });

  map.addLayer({
    'id': 'ParisHeat',
    'source': 'Parisheatmap',
    'type': 'heatmap',
    'maxzoom':14,
    'paint': {
        // Increase the heatmap weight based on frequency and property magnitude
        'heatmap-weight': ['interpolate',['linear'],['get', 'pics'],0,0,73066,1],
        // Increase the heatmap color weight weight by zoom level
        // heatmap-intensity is a multiplier on top of heatmap-weight
        'heatmap-intensity': ['interpolate',['linear'],['zoom'],5,1,13,3],
        // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
        // Begin color ramp at 0-stop with a 0-transparancy color
        // to create a blur-like effect.
        'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,'rgba(236,213,244,0)',
        0.01,'rgba(236,213,244,1)',
        0.2,'#d5a3f7',
        0.4,'#c27af9',
        0.6,'#b45cfa',
        0.8,'#a943fb',
        1,'#a131fc'
        ],
        // Adjust the heatmap radius by zoom level
        'heatmap-radius': {"base": 2,"stops": [[9,4],[18,1024]]},
        'heatmap-opacity':0.5
      }
  });

  inputs.forEach(function (input, handle) {
        input.addEventListener('change', updateMap)});

  slider.noUiSlider.on('update', updateMap);
})

map.on("click", function(e){
  if(flying==false){
    function getAddress(other){
    $.get('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+ e.lngLat.lat.toString(10) +'&lon='+e.lngLat.lng.toString(10), function(data){
        address = data.address;
    });
    other(makeMarker);
    }
    // pulls the actual flickr data nearby the point
    function doJson(other){
    $.getJSON("https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=ca370d51a054836007519a00ff4ce59e&page&per_page="+num.toString(10)+"&format=json&nojsoncallback=1&privacy_filter=1& accuracy=16&lat="+e.lngLat.lat.toString(10)+"&lon="+e.lngLat.lng.toString(10)+"&radius="+rad.toString(10),function(json){
        if(parseInt(json.photos.total)>0){

        $.each(json.photos.photo,function(i,result){
        picurl = "https://farm"+result.farm +".staticflickr.com/"+result.server +"/"+result.id+"_"+ result.secret+".jpg";
        arr.push('<img src="'+picurl+'"/><br><p>'+result.title+'</p><br><br>');
        })
        arr.push("<center><h2>***</h2></center><h2>Displaying " +Math.min(num, json.photos.total).toString(10)+" out of the "+json.photos.total.toString(10)+" total photos found on Flickr within "+ rad.toString(10)*1000 +" meters</h2><center><button id='changeradbutton' class='changeradbutton'>Change Search Radius</button></center><p>Location: <a href='https://www.google.com/maps/@?api=1&map_action=pano&viewpoint="+e.lngLat.lat.toString(10)+"&comma;"+e.lngLat.lng.toString(10)+"&heading=-45&pitch=0&fov=80' target='_blank'>");
        if(address){arr.push(address.road+"&comma; "+address.city+"&comma; "+address.country+"&comma; "+address.postcode+"</a></p>")}else{arr.push("Error loading address</a></p>")};
        }
        else{
            arr.push('<p>No photograph is available to the public within a '+ rad.toString(10)*1000 +'m radius of this point</p></p>')
            radiusinm = rad*1000
            smallpopup = radiusinm.toString(10);
        }
        other();
    })}
    // makes the marker with all of the info passed in the getJson function
    function makeMarker(){
        arr.push("<div>");
        console.log(arr)
        var allpics = arr.toString();
        allpics = allpics.replace(/,/g, "");
        if(smallpopup != 0){
          allpics = '<div style:"height:100px"><h2><center>No photograph found <br><br> within '
          allpics = allpics.concat(smallpopup)
          allpics = allpics.concat(' meters</center></h2><br><center><button id="changeradbutton" class="changeradbutton">Change Search Radius</button></center></div>')
          let popup = new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(allpics).setMaxWidth("200px").addTo(map)
          smallpopup = 0
        }else{let popup = new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(allpics).setMaxWidth("700px").addTo(map)}
        picurl = ""
        arr = ['<div class = "popup"><input autofocus style="display:none;"><br>']
        document.getElementById("changeradbutton").addEventListener('click', function () {
        let prompt = window.prompt('Enter radius in meters')
         rad = prompt != "" ? parseInt(prompt)*0.001 : rad
        })

    }
    getAddress(doJson);
  }
})

function flybuttonhide(place){
  document.getElementById('flyNYC').style.display = 'block'
  document.getElementById('flyTokyo').style.display = 'block'
  document.getElementById('flyParis').style.display = 'block'
  place == 'NYC' ? document.getElementById('flyNYC').style.display = 'none' :
  place == 'Paris' ? document.getElementById('flyParis').style.display = 'none' :
  place == 'Tokyo' ? document.getElementById('flyTokyo').style.display = 'none' :
  console.log('error flybuttonhide() requires a valid place name')
}

flybuttonhide('Tokyo')

document.getElementById('flyNYC').addEventListener('click', function () {
  map.fire('flystart');
  map.flyTo({
    center: [ -73.9919795,40.7274305281328],
    zoom: 14.5,
    speed: 1.5,
    curve: 1,
    easing(t) {
    return t;
  }})
  class1 = 1;
  class2 = 10;
  class3 = 81;
  class4 = 469;
  maxpic = 22713;
  document.getElementById('legendmodule').style.display = 'none'
  flybuttonhide('NYC')
});

document.getElementById('flyTokyo').addEventListener('click', function () {
  map.fire('flystart');
  map.flyTo({
    center: [139.7065616,35.6672814],
    zoom: 14,
    speed: 1.5,
    curve: 1,
    easing(t) {
    return t;
  }})
  var class1 = 2;
  var class2 = 7;
  var class3 = 57;
  var class4 = 706;
  var maxpic = 31271;
  document.getElementById('legendmodule').style.display = 'none'
  flybuttonhide('Tokyo')
});

document.getElementById('flyParis').addEventListener('click', function () {
  map.fire('flystart');
  map.flyTo({
    center: [2.3522,48.8566],
    zoom: 14,
    speed: 1.5,
    curve: 1,
    easing(t) {
    return t;
  }})
  var class1 = 2;
  var class2 = 7;
  var class3 = 57;
  var class4 = 706;
  var maxpic = 85538;
  document.getElementById('legendmodule').style.display = 'none'
  flybuttonhide('Paris')
});

function moved(){
  slider.noUiSlider.updateOptions({
    start: [Math.log(class1), Math.log(class2), Math.log(class3), Math.log(class4)],
    connect: [true, true, true, true, true],
    range: {
        'min': [0],
        'max': [Math.log(maxpic)],
    }
  })
  updateMap()
  fadein('legendmodule')
}

map.on('flystart', function(){
    flying = true;
    //console.log('flystart')
    map.dragPan.disable();
    map.scrollZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.dragRotate.disable();
    map.dragPan.disable();
    map.keyboard.disable();
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
    map.keyboard.enable();
    map.touchPitch.enable();
    map.touchZoomRotate.enable();
});
map.on('moveend', function(e){
   if(flying){
      moved()
      //console.log('movedexec')
      map.fire('flyend');
   }
});
