// Get dateset
link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//         CREATE THE INITIAL MAP         //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// Create the map object with options.
let earthquakesMap = L.map("map", {
    center: [40.73, -74.0059],
    zoom: 3,
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//         CREATE THE MAP TILES           //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// Create the tile layer that will be the background of our map.
let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(earthquakesMap);

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//        SETTING THE OPTIONS BOX         //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// Create a baseMaps object to hold the streetmap AND the topographic map layers.
let baseMaps = {
    "Street Map": streetmap,
    "Topographic Map": topo
    };

let earthquakesLocations = new  L.LayerGroup();

// Create an overlayMaps object to hold the Earthwuakes location layer.
let overlayMaps = {
    "Earthquakes Locations": earthquakesLocations  
};
  
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//      CREATE THE CONTROLLER LAYER       //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }
).addTo(earthquakesMap);

// ------------------------------------------------------------------ //
//                   READING OUR DATA - USING D3                      //
// ------------------------------------------------------------------ //
// Getting our GeoJSON data
d3.json(link).then(function(data) {
    console.log(data); 
    
    // Save the features into a variable named "features"
    let features = data.features;
    console.log(features);

    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
    //        Function FOR MARKER SIZE        //
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
    function markerSize(magnitude){
      if (magnitude === 0 ) {
        return 1;
      }
      return magnitude * 4;
    }
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
    //       Function FOR MARKER COLOR        //
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
    // Earthquakes with greater depth should appear darker in color.
    function markerColor(depth) {
        if (depth < 10) return "#98EE00";   
        else if (depth < 30) return "#D4EE00";  
        else if  (depth < 50) return "#EECC00"; 
        else if (depth < 70) return "#EE9C00"; 
        else if (depth < 90) return "#EA822C"; 
        else return "#EA2C2C"; 
      }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
    //       Function FOR MARKER STYLE        //
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
    function markeroption(features){  // WE COULD NAME THE VARIABLE FEATURE OR FEATURES
      return {                        // BUT IF FOR EXAMPLE, WHEN CALLING THE COORDINATES B4 GEO EVERYTHING VAR HAS TO BE THE SAME
        fillColor : markerColor(features.geometry.coordinates[2]),
        color: "#000000",   // black
        radius: markerSize(features.properties.mag),
        stroke: true, 
        weight: 0.5,
        fillOpacity: 0.4,
        opacity: 1
      };
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
    //         DISPLAYING THE MARKERS         //
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
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
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
    //             CREATE A LEGEND            //
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
    let legend = L.control({position: "bottomright"});
    legend.onAdd = function() {

        let div = L.DomUtil.create("div", "info legend");
        let depthIntervals = [-10, 10, 30, 50, 70, 90];
        let colors = ["#98EE00", "#D4EE00", "#EECC00", "#EE9C00", "#EA822C", "#EA2C2C"];

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