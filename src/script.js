const width = 960 * 2;
const height = 600 * 2;

// Load Philadelphia map data and crash data
let phillyMap = d3.json("/assets/phillyRoads.json");
let phillyCSV = d3.csv("/assets/philly_crashes.csv");

// Set up the map projection
const projection = d3.geoMercator()
    .center([-75.1652, 39.9526])
    .scale(90000)
    .translate([width / 3, height / 2.6]);

const path = d3.geoPath().projection(projection);

Promise.all([
    phillyMap,
    phillyCSV
]).then(([phillyMap, crashData]) => {

    // Create the main SVG element
    const svg = d3.select("#visualization").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", function (event) {
            svg.attr("transform", event.transform);
        }))
        .append("g");

    // Filter and count fatal crashes
    const fatalCrashes = crashData.filter(d => +d.FATAL_COUNT > 0);
    const fatalityCount = fatalCrashes.reduce((sum, d) => sum + +d.FATAL_COUNT, 0);

    // Add text for the first slide with animation
    svg.append("text")
        .attr("x", width / 4)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("fill", "black")
        .style("opacity", 0)
        .text(`In 2023, there were ${fatalityCount} traffic fatalities in the city of Philadelphia.`)
        .transition()
        .duration(1000)
        .style("opacity", 1);

    // Draw the roads with animation (delayed)
    svg.selectAll("path.road")
        .data(phillyMap.features.filter(d => d.properties.highway))
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", d => d.properties.highway === "residential" ? "grey" : "black")
        .attr("stroke-width", 0)
        .transition()
        .delay(1000) // Delay after text animation
        .duration(2000)
        .attr("stroke-width", d => d.properties.highway === "residential" ? 0.5 : 2);

    // Draw the city boundary with animation (delayed)
    svg.selectAll("path.boundary")
        .data(phillyMap.features.filter(d => d.properties.boundary === 'administrative'))
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 0)
        .transition()
        .delay(1000) // Delay after text animation
        .duration(3000)
        .attr("stroke-width", 3);

    // Plot crash locations with animation (delayed)
    svg.selectAll("circle.crash")
        .data(fatalCrashes)
        .enter()
        .append("circle")
        .attr("class", "crash")
        .attr("cx", d => projection([+d.DEC_LONG, +d.DEC_LAT])[0])
        .attr("cy", d => projection([+d.DEC_LONG, +d.DEC_LAT])[1])
        .attr("r", 0)
        .attr("fill", "red")
        .attr("opacity", 0)
        .transition()
        .delay(4000) // Delay after map animation
        .duration(2000)
        .attr("r", 4)
        .attr("opacity", 0.6);

    // Add a button to trigger animations
    d3.select("#visualization")
        .append("button")
        .text("Animate")
        .on("click", animateVisualization);

    function animateVisualization() {
        // Reset all elements
        svg.selectAll("path").attr("stroke-width", 0);
        svg.selectAll("text").style("opacity", 0);
        svg.selectAll("circle").attr("r", 0).attr("opacity", 0);

        // Animate text
        svg.selectAll("text")
            .transition()
            .duration(1000)
            .style("opacity", 1);

        // Animate roads and boundary (delayed)
        svg.selectAll("path")
            .transition()
            .delay(1000)
            .duration(2000)
            .attr("stroke-width", function() {
                if (this.classList.contains("boundary")) return 3;
                return this.classList.contains("road") ? 0.5 : 2;
            });

        // Animate crash points (delayed)
        svg.selectAll("circle.crash")
            .transition()
            .delay(3000)
            .duration(2000)
            .attr("r", 4)
            .attr("opacity", 0.6);
    }
});