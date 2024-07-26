// Constants and data loading
const width = 960 * 2;
const height = 600 * 2;

let phillyMap = d3.json("/assets/phillyRoads.json");
let phillyCSV = d3.csv("/assets/philly_crashes.csv");

Promise.all([phillyMap, phillyCSV]).then(([phillyMap, fullCrashData]) => {
    const phillyCenter = [-75.1652, 39.9526];
    const scale = 200000;

    const projection = d3.geoMercator()
        .center(phillyCenter)
        .scale(scale)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const svg = d3.select("#visualization").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .call(d3.zoom().on("zoom", function (event) {
            svg.attr("transform", event.transform);
        }))
        .append("g");

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Create a container for the text overlay
    const textOverlay = d3.select("#visualization")
        .append("div")
        .attr("class", "text-overlay")
        .style("position", "absolute")
        .style("top", "20px")
        .style("left", "20px")
        .style("background-color", "rgba(255, 255, 255, 0.7)")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("opacity", 0);

    // Draw the roads with fade-in effect
    svg.selectAll("path.road")
        .data(phillyMap.features.filter(d => d.properties.highway))
        .enter()
        .append("path")
        .attr("class", "road")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", d => d.properties.highway === "residential" ? "grey" : "black")
        .attr("stroke-width", d => d.properties.highway === "residential" ? 0.5 : 2)
        .style("opacity", 0)
        .transition()
        .duration(2000)
        .style("opacity", 1);

    let currentSlide = 0;
    let crashData;

    function filterDataByYear(year) {
        return fullCrashData.filter(d => d.CRASH_YEAR === year);
    }

    function showSlide(slideIndex) {
        currentSlide = slideIndex;
        svg.selectAll(".crash-point, .cluster-point").remove();
        d3.selectAll(".tooltip").style("opacity", 0);
        textOverlay.html("");

        switch (slideIndex) {
            case 0:
                showAllCollisions();
                break;
            case 1:
                showFatalities();
                break;
            case 2:
                showBicycleFatalities();
                break;
        }
    }

    function showAllCollisions() {
        const collisionCount = crashData.length;

        textOverlay.html(`<h2>In ${yearSelect.property("value")}, there were ${collisionCount} traffic collisions in Philadelphia</h2>`)
            .transition()
            .duration(1000)
            .style("opacity", 1);

        // First, add this tooltip div to your HTML or create it in your JavaScript
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("pointer-events", "none");

        // Then, modify your crash point creation code
        svg.selectAll(".crash-point")
            .data(crashData)
            .enter()
            .append("circle")
            .attr("class", "crash-point")
            .attr("cx", d => projection([+d.DEC_LONG, +d.DEC_LAT])[0])
            .attr("cy", d => projection([+d.DEC_LONG, +d.DEC_LAT])[1])
            .attr("r", 2)
            .attr("fill", "blue")
            .attr("opacity", 0)
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("r", 5);

                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Date: ${d.CRASH_MONTH}/${d.CRASH_YEAR}<br>
                      Time: ${d.HOUR_OF_DAY}:00<br>
                      Fatalities: ${d.FATAL_COUNT}<br>
                      Injuries: ${d.INJURY_COUNT}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("r", 2);

                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition()
            .duration(1000)
            .attr("opacity", 0.3);
    }

    function showFatalities() {
        const fatalCrashes = crashData.filter(d => +d.FATAL_COUNT > 0);
        const fatalityCount = fatalCrashes.length;

        textOverlay.html(`<h2>Of these, ${fatalityCount} collisions resulted in fatalities</h2>`)
            .transition()
            .duration(1000)
            .style("opacity", 1);

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("pointer-events", "none");

        // For fatal crashes
        svg.selectAll(".crash-point")
            .data(fatalCrashes)
            .enter()
            .append("circle")
            .attr("class", "crash-point")
            .attr("cx", d => projection([+d.DEC_LONG, +d.DEC_LAT])[0])
            .attr("cy", d => projection([+d.DEC_LONG, +d.DEC_LAT])[1])
            .attr("r", 4)
            .attr("fill", "red")
            .attr("opacity", 0)
            .on("mouseover", function (event, d) {
                d3.select(this).attr("r", 6);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Date: ${d.CRASH_MONTH}/${d.CRASH_YEAR}<br>
                      Time: ${d.HOUR_OF_DAY}:00<br>
                      Fatalities: ${d.FATAL_COUNT}<br>
                      Injuries: ${d.INJURY_COUNT}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("r", 4);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition()
            .duration(1000)
            .attr("opacity", 0.6);
    }

    function showBicycleFatalities() {
        const bicycleFatalities = crashData.filter(d => +d.BICYCLE_DEATH_COUNT > 0);
        const bicycleFatalityCount = bicycleFatalities.length;

        textOverlay.html(`<h2>${bicycleFatalityCount} bicycle fatalities occurred in Philadelphia</h2>`)
            .transition()
            .duration(1000)
            .style("opacity", 1);

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("pointer-events", "none");

        // For bicycle fatalities
        svg.selectAll(".crash-point")
            .data(bicycleFatalities)
            .enter()
            .append("circle")
            .attr("class", "crash-point")
            .attr("cx", d => projection([+d.DEC_LONG, +d.DEC_LAT])[0])
            .attr("cy", d => projection([+d.DEC_LONG, +d.DEC_LAT])[1])
            .attr("r", 5)
            .attr("fill", "orange")
            .attr("opacity", 0)
            .on("mouseover", function (event, d) {
                d3.select(this).attr("r", 7);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Date: ${d.CRASH_MONTH}/${d.CRASH_YEAR}<br>
                      Time: ${d.HOUR_OF_DAY}:00<br>
                      Bicycle Fatalities: ${d.BICYCLE_DEATH_COUNT}<br>
                      Total Fatalities: ${d.FATAL_COUNT}<br>
                      Injuries: ${d.INJURY_COUNT}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("r", 5);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition()
            .duration(1000)
            .attr("opacity", 0.8);
    }

    // Add click event to progress through slides
    d3.select("#visualization").on("click", () => {
        currentSlide = (currentSlide + 1) % 3;
        showSlide(currentSlide);
    });

    // Year selection
    const years = [...new Set(fullCrashData.map(d => d.CRASH_YEAR))].sort();
    const yearSelect = d3.select("#visualization")
        .append("select")
        .attr("id", "yearSelect")
        .style("position", "absolute")
        .style("top", "10px")
        .style("right", "10px");

    yearSelect.selectAll("option")
        .data(years)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    yearSelect.on("change", function () {
        const selectedYear = this.value;
        crashData = filterDataByYear(selectedYear);
        showSlide(currentSlide);
    });

    // Initialize with the most recent year
    const mostRecentYear = years[years.length - 1];
    yearSelect.property("value", mostRecentYear);
    crashData = filterDataByYear(mostRecentYear);
    showSlide(0);
});