mapboxgl.accessToken = 'pk.eyJ1Ijoia2F6dXRvbiIsImEiOiJja3Bhd2RpMGQwdDE1MnFvMXJwbmhnMmoxIn0.elQ7_sz1l4YQk3KVYjJz9Q';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [ -73.984016,40.754932],
  minZoom: 3,
  zoom: 12
  });


  map.on('load', function () {
    map.addSource('landvalue', {
      'type': 'geojson',
      //'url': 'https://kazuto-nishimori.github.io/Portfolio/Maps/Manhattan-Buildings/ManhBuildings.geojson'
      'url': 'ManhBuildings.geojson'
    });

    map.addLayer({
    'id': 'landvalue',
    'source': 'landvalue',
    'type': 'fill',
    "paint": {
      "fill-color": "#00ffff"
    }
    })
  });
