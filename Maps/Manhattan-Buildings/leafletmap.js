var mymap = L.map('map').setView([-73.984016,40.754932], 12);
var myStyle = {
        "color": "#ff7800",
        "weight": 5,
        "opacity": 0.65
    };

var geojson = new L.GeoJSON.AJAX("https://kazuto-nishimori.github.io/Portfolio/Maps/Manhattan-Buildings/LandValue.geojson",{
         style:myStyle});

geojson.addTo(mymap);
