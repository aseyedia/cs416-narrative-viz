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
]).then(([phillyMap, crashData]) => {

    const svg = d3.select("#visualization").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", function (event) {
            svg.attr("transform", event.transform);
        }))
        .append("g");

    // Draw the roads
    svg.selectAll("path.road")
        .data(phillyMap.features.filter(d => d.properties.highway))
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", d => {
            if (d.properties.highway === "residential") {
                return "grey";
            } else {
                return "black";
            }
        })
        .attr("stroke-width", d => {
            if (d.properties.highway === "residential") {
                return 0.5;
            } else {
                return 2;
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

    // Filter and count fatal crashes
    const fatalCrashes = crashData.filter(d => +d.FATAL_COUNT > 0);
    const fatalityCount = fatalCrashes.reduce((sum, d) => sum + +d.FATAL_COUNT, 0);

    // Add text for the first slide
    svg.append("text")
        .attr("x", width / 4)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("fill", "black")
        .text(`In 2023, there were ${fatalityCount} traffic fatalities in the city of Philadelphia`);

    // Plot crash locations
    svg.selectAll("circle.crash")
        .data(fatalCrashes)
        .enter()
        .append("circle")
        .attr("class", "crash")
        .attr("cx", d => projection([+d.DEC_LONG, +d.DEC_LAT])[0])
        .attr("cy", d => projection([+d.DEC_LONG, +d.DEC_LAT])[1])
        .attr("r", 4)
        .attr("fill", "red")
        .attr("opacity", 0.6);
});