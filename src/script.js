const width = 960;
const height = 600;

const projection = d3.geoMercator()
  .center([-75.1652, 39.9526])  // Center on Philadelphia
  .scale(70000)
  .translate([width / 2, height / 1.6]);

const path = d3.geoPath().projection(projection);

let phillySVG = d3.xml('/assets/Philadelphia (1).svg')
// let phillyMap = d3.json("/assets/geojson.json")
let phillyMap = d3.json("https://raw.githubusercontent.com/blackmad/neighborhoods/master/philadelphia.geojson")
let phillyCSV = d3.csv("/assets/philly_crashes.csv")

// const boundingBox = phillyMap.boundingbox;
// const projection = d3.geoMercator()
//     .fitExtent([[0, 0], [width, height]], {
//         type: "Polygon",
//         coordinates: [[
//             [boundingBox[2], boundingBox[0]],
//             [boundingBox[3], boundingBox[0]],
//             [boundingBox[3], boundingBox[1]],
//             [boundingBox[2], boundingBox[1]],
//             [boundingBox[2], boundingBox[0]]
//         ]]
//     });

Promise.all([phillySVG, phillyMap, phillyCSV])
    .then(([svgData, phillyMap, crashData]) => {
        const svg = d3.select("#visualization").append("svg")
        .attr("width", width)
        .attr("height", height);
    
      // Append the loaded SVG to the container
      const importedSVG = d3.select(svgData.documentElement);
      svg.node().appendChild(importedSVG.node());
    
      // Draw the Philadelphia boundaries on top of the SVG
      svg.selectAll(".boundary")
        .data([phillyMap])
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2);
        // Extract and append the entire SVG content
        // const importedSVG = d3.select(svgData.documentElement);
        // const svgContent = importedSVG.html();

        // svg.append("g")
        //     .attr("class", "philly-roads")
        //     .html(svgContent);

        // Style or modify specific elements if needed
        // svg.select("#Land").remove();  // Remove the land layer if you don't need it
        // svg.selectAll(".st1")  // Assuming .st1 is the class for primary roads
        //     .attr("stroke", "#4788c8")
        //     .attr("stroke-width", 1);


        svg.selectAll("path").attr("fill", d => {
            console.log(d + "this is d")
            const zipCode = d.properties.ZIP_CODE;  // Assuming ZIP_CODE is a property of your GeoJSON data
            return colorScale(fatalitiesByZip.get(zipCode) || 0);
          });
      

    });
