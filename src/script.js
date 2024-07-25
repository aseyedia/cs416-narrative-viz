// Constants and data loading
const width = 960 * 2;
const height = 600 * 2;

let phillyMap = d3.json("/assets/phillyRoads.json");
let phillyCSV = d3.csv("/assets/philly_crashes.csv");

// subset phillyCSV to only 2023
phillyCSV = phillyCSV.then(data => data.filter(d => d.CRASH_YEAR === "2023"));

Promise.all([phillyMap, phillyCSV]).then(([phillyMap, crashData]) => {
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
    let allCrashes, bicycleFatalities;

    function showSlide(slideIndex) {
        currentSlide = slideIndex;
        svg.selectAll(".crash-point, .cluster-point").remove();
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
            case 3:
                showDataQualityIssues();
                break;
        }
    }

    function showAllCollisions() {
        allCrashes = crashData;
        const collisionCount = allCrashes.length;

        textOverlay.html(`<h2>In 2023, there were ${collisionCount} traffic collisions in Philadelphia</h2>`)
            .transition()
            .duration(1000)
            .style("opacity", 1);

        svg.selectAll(".crash-point")
            .data(allCrashes)
            .enter()
            .append("circle")
            .attr("class", "crash-point")
            .attr("cx", d => projection([+d.DEC_LONG, +d.DEC_LAT])[0])
            .attr("cy", d => projection([+d.DEC_LONG, +d.DEC_LAT])[1])
            .attr("r", 2)
            .attr("fill", "blue")
            .attr("opacity", 0)
            .transition()
            .duration(1000)
            .attr("opacity", 0.3);
    }

    function showFatalities() {
        const fatalCrashes = crashData.filter(d => +d.FATAL_COUNT > 0);
        const fatalityCount = fatalCrashes.reduce((sum, d) => sum + +d.FATAL_COUNT, 0);

        textOverlay.html(`<h2>Of these, ${fatalityCount} collisions resulted in fatalities</h2>`)
            .transition()
            .duration(1000)
            .style("opacity", 1);

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
            .transition()
            .duration(1000)
            .attr("opacity", 0.6);
    }


    function showBicycleFatalities() {
        bicycleFatalities = crashData.filter(d => +d.BICYCLE_DEATH_COUNT > 0);
        const bicycleFatalityCount = bicycleFatalities.reduce((sum, d) => sum + +d.BICYCLE_DEATH_COUNT, 0);

        textOverlay.html(`<h2>${bicycleFatalityCount} bicycle fatalities occurred in Philadelphia</h2>`)
            .transition()
            .duration(1000)
            .style("opacity", 1);

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
            .transition()
            .duration(1000)
            .attr("opacity", 0.8);
    }

    function showDataQualityIssues() {
        textOverlay.html(`
            <h2>Major Issues with Bicycle Collision Data</h2>
            <p>1. <strong>Missing Helmet Data:</strong> The 2023 dataset omits the crucial <code>PC_HELM_IND</code> column, 
               which previously indicated whether cyclists wore helmets during collisions.</p>
            <p>2. <strong>Imprecise Location Data:</strong> Many collisions are clustered at generic coordinates, 
               limiting our ability to identify specific high-risk areas.</p>
            <p>3. <strong>Data Inconsistency:</strong> The removal of the helmet data makes it impossible to compare 
               safety trends with previous years or assess the effectiveness of helmet laws.</p>
            <p>Click on the red circles to see examples of location clustering.</p>
        `)
            .style("font-size", "14px")
            .style("line-height", "1.4")
            .style("max-width", "400px")
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
            .style("padding", "10px");

        svg.selectAll(".cluster-point")
            .data(clusteredLocations)
            .enter()
            .append("circle")
            .attr("class", "cluster-point")
            .attr("cx", d => projection(d.coords)[0])
            .attr("cy", d => projection(d.coords)[1])
            .attr("r", d => Math.sqrt(d.count) * 3)
            .attr("fill", "red")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("opacity", 0)
            .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke-width", 3);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`
                    <strong>Location:</strong> (${d.coords[1].toFixed(4)}, ${d.coords[0].toFixed(4)})<br>
                    <strong>Reported fatalities:</strong> ${d.count}<br>
                    <strong>Issue:</strong> Multiple incidents recorded at the same coordinates
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke-width", 1);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition()
            .duration(1000)
            .attr("opacity", 0.8);

        // Example of overlapping clusteredLocations
        const exampleCluster = clusteredLocations[0];
        svg.append("text")
            .attr("x", projection(exampleCluster.coords)[0] + 15)
            .attr("y", projection(exampleCluster.coords)[1] - 15)
            .text(`Example cluster: ${exampleCluster.count} fatalities`)
            .attr("font-size", "12px")
            .attr("fill", "black")
            .attr("opacity", 0)
            .transition()
            .duration(1000)
            .attr("opacity", 1);
    }

    // Initialize with the first slide
    showSlide(0);

    // Add click event to progress through slides
    d3.select("#visualization").on("click", () => {
        currentSlide = (currentSlide + 1) % 4;
        showSlide(currentSlide);
        // Clear all tooltips
        d3.selectAll(".tooltip").style("opacity", 0);
    });

    // Year selection
    const years = [...new Set(crashData.map(d => d.CRASH_YEAR))].sort();
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
        crashData = phillyCSV.filter(d => d.CRASH_YEAR === selectedYear);
        showSlide(currentSlide);
    });
});