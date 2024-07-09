const width = 960;
const height = 600;

let currentSlide = 0;
const slides = [
    { title: "Overview", content: "" },
    { title: "Fatality Hotspots", content: "" },
    { title: "Time of Day Analysis", content: "" },
    { title: "Vehicle Types Involved", content: "" },
    { title: "Demographic Insights", content: "" }
];

// let phillySVG = d3.xml('/assets/Philadelphia (1).svg')
let phillyMap = d3.json("/assets/geojson.json")
// let phillyMap = d3.json("https://raw.githubusercontent.com/blackmad/neighborhoods/master/philadelphia.geojson")
let phillyCSV = d3.csv("/assets/philly_crashes.csv")

// const boundingBox = phillyMap

const projection = d3.geoMercator()
    .center([-75.1652, 39.9526])  // Center on Philadelphia
    .scale(70000)
    .translate([width / 2, height / 1.6]);

const path = d3.geoPath().projection(projection);

Promise.all([
    d3.xml('/assets/Philadelphia (1).svg'),
    phillyMap,
    d3.csv("/assets/philly_crashes.csv")
]).then(([svgData, phillyMap, crashData]) => {
    const svg = d3.select("#visualization").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Append the loaded SVG to the container
    const importedSVG = d3.select(svgData.documentElement);
    svg.node().appendChild(importedSVG.node());

    // Draw the Philadelphia boundaries on top of the SVG
    svg.selectAll(".boundary")
        .data([phillyMap.geojson])
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "none")  // This makes it transparent
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .raise(); // Bring phillyMap to the front

});
