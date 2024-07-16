const width = 960 * 2;
const height = 600 * 2;

let phillyMap = d3.json("/assets/phillyRoads.json");
let phillyCSV = d3.csv("/assets/philly_crashes.csv");

const projection = d3.geoMercator()
    .center([-75.1652, 39.9526])
    .scale(90000)
    .translate([width / 3, height / 3]);

const path = d3.geoPath().projection(projection);

Promise.all([
    phillyMap,
    phillyCSV
]).then(([phillyMap]) => {

    const svg = d3.select("#visualization").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", function (event) {
            svg.attr("transform", event.transform);
        }))
        .append("g");

    console.log(phillyMap);

    // Draw the roads
    svg.selectAll("path.road")
        .data(phillyMap.features.filter(d => d.properties.highway))
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", d => {
            if (d.properties.highway === "residential") {
                return "grey"; // Use a lighter color for residential roads if desired
            } else {
                return "black";
            }
        })
        .attr("stroke-width", d => {
            if (d.properties.highway === "residential") {
                return 0.5; // Thinner stroke for residential roads
            } else {
                return 2; // Thicker stroke for primary and secondary roads
            }
        });

    // Draw the city boundary
    svg.selectAll("path.boundary")
        .data(phillyMap.features.filter(d => d.properties.boundary === 'administrative'))
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 3);

});
