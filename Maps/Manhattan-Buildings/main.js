
  mapboxgl.accessToken = 'pk.eyJ1Ijoia2F6dXRvbiIsImEiOiJja3Bhd2RpMGQwdDE1MnFvMXJwbmhnMmoxIn0.elQ7_sz1l4YQk3KVYjJz9Q';

  var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [ -73.984016,40.754932],
  zoom: 12
  });


  map.on('load', function () {
  	map.addSource('migrantdeaths', {
  		type: 'geojson',
  		data: "https://kazuto-nishimori.github.io/Portfolio/Maps/Arizona-Migration/arizona.geojson"
  	});

  	map.addLayer({
  		'id': 'death-circle',
      'source': 'migrantdeaths',
  		'type': 'circle',
      'paint': {'circle-color': "red", 'circle-radius' : 0, 'circle-opacity':0.7}

  	});

  });
