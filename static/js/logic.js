// Get dateset
link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create the map with options.
let earthquakesMap = L.map("map", {
    center: [40.73, -74.0059],
    zoom: 3,
});

// Create a layer for the background of the map.
let streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(earthquakesMap);

let topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});


// Create the baseMaps object to hold the streetMap and the topoMap layers.
let baseMaps = {
    "Street Map": streetMap,
    "Topographic Map": topoMap
    };

let earthquakesLocations = new  L.LayerGroup();

// Create an overlayMaps object to hold the Earthwuakes location layer.
let overlayMaps = {
    "Earthquakes Locations": earthquakesLocations  
};
  

// Create the layer control for the map.
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }
).addTo(earthquakesMap);


// Getting our GeoJSON data
d3.json(link).then(function(data) {
    console.log(data); 
    
    // Save the features into a variable named "features"
    let features = data.features;
    console.log(features);

    // Create function for marker size       
    function markerSize(magnitude){
      if (magnitude === 0 ) {
        return 1;
      }
      return magnitude * 4;
    }

    // Earthquakes with greater depth should appear darker in color.
    function markerColor(depth) {
        if (depth < 10) return "#2af70a";   
        else if (depth < 30) return "#edff04";  
        else if  (depth < 50) return "#f1cf03"; 
        else if (depth < 70) return "#f3a003"; 
        else if (depth < 90) return "#ec8128"; 
        else return "#ef2b2b"; 
      }

    //Function for markeroption
    function markeroption(features){
      return { 
        fillColor : markerColor(features.geometry.coordinates[2]),
        color: "black", 
        radius: markerSize(features.properties.mag),
        stroke: true, 
        weight: 0.5,
        fillOpacity: 0.4,
        opacity: 1
      };
    }

    //Display the marker
    L.geoJSON(data, {     
          pointToLayer: function (feature, latlng){
            return L.circleMarker(latlng);
          },  
          style: markeroption, 

          // Give each feature a popup that describes the place and time of the earthquake.
          onEachFeature: function(feature, layer) {
            layer.bindPopup(`
                      <h3>${feature.properties.place}</h3> <hr> 
                      <p> 
                        ${new Date(feature.properties.time)} <br>
                        Magnitude: ${feature.properties.mag} <br>
                        Depth: ${feature.geometry.coordinates[2]}
                      </p>`);
          }   
    }).addTo(earthquakesLocations);
    
    //Creating the legen
    let legend = L.control({position: "bottomright"});
    legend.onAdd = function() {

        let div = L.DomUtil.create("div", "info legend");
        let depthIntervals = [-10, 10, 30, 50, 70, 90];
        let colors = ["#2af70a", "#edff04", "#f1cf03", "#f3a003", "#ec8128", "#ef2b2b"];

        // Loop through the depth Intervals and generate a label with a colored square for each interval.       
        for (let i = 0; i < depthIntervals.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i> ' +
                depthIntervals[i] + (depthIntervals[i + 1] ? "&ndash;" + depthIntervals[i + 1] + "<br>" : "+");
        }
            return div;
    };
    legend.addTo(earthquakesMap);
  });    