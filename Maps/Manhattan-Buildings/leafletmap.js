var mymap = L.map('map').setView([-73.984016,40.754932], 12);
var myStyle = {
        "color": "#ff7800",
        "weight": 5,
        "opacity": 0.65
    };

var geojson = new L.GeoJSON.AJAX("https://kazuto-nishimori.github.io/Portfolio/Maps/Manhattan-Buildings/LandValue.geojson",{
         style:myStyle});

geojson.addTo(mymap);


map.on('load', function () {
  map.addSource('landvalue', {
    'type': 'geojson',
    'data': 'https://kazuto-nishimori.github.io/Portfolio/Maps/Manhattan-Buildings/LandValue.geojson'
    //'url': 'ManhBuildings.geojson'
  });

  map.addLayer({
  'id': 'landvaluelayer',
  'source': 'landvalue',
  'type': 'fill',
  "paint": {
    "fill-color": "black"
  }
});
