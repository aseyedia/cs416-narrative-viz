const width = 960 * 2;
const height = 600 * 2;

let phillyMap = d3.json("/assets/phillyRoads.json");
let phillyCSV = d3.csv("/assets/philly_crashes.csv");

const projection = d3.geoMercator()
    .center([-75.1652, 39.9526])
    .scale(70000)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

Promise.all([
    phillyMap,
    phillyCSV
]).then(([phillyMap, crashData]) => {

    const svg = d3.select("#visualization").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", function (event) {
            svg.attr("transform", event.transform);
        }))
        .append("g");

    console.log(phillyMap);

    svg.selectAll("path")
        .data(phillyMap.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", d => {
            // Differentiate the stroke width based on the highway type
            if (d.properties.highway === "residential") {
                return "grey"; // Use a lighter color for residential roads if desired
            } else {
                return "black";
            }
        })
        .attr("stroke-width", d => {
            if (d.properties.highway === "residential") {
                return 1; // Thinner stroke for residential roads
            } else {
                return 2; // Thicker stroke for primary and secondary roads
            }
        })
        .attr("width", width)
        .attr("height", height);

});
