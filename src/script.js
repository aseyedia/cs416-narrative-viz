// Constants and data loading
const width = 960 * 2;
const height = 600 * 2;

let phillyMap = d3.json("/assets/phillyRoads.json");
let phillyCSV = d3.csv("/assets/philly_crashes.csv");

Promise.all([phillyMap, phillyCSV]).then(([phillyMap, crashData]) => {
    const phillyCenter = [-75.1652, 39.9526];
    const scale = 500000;

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

    // Clustered bicycle fatality locations
    const clusteredLocations = [
        { coords: [-74.9765, 40.0913], count: 8 },
        { coords: [-75.0848, 40.0341], count: 12 },
        { coords: [-75.116, 40.0289], count: 8 },
        { coords: [-75.1346, 39.9788], count: 8 },
        { coords: [-75.1448, 39.9273], count: 12 },
        { coords: [-75.1539, 39.9939], count: 4 },
        { coords: [-75.1779, 39.8996], count: 9 },
        { coords: [-75.2312, 40.0538], count: 27 },
        { coords: [-75.2467, 39.9627], count: 24 },
    ];

    function showSlide(slideIndex) {
        currentSlide = slideIndex;
        svg.selectAll(".crash-point, .cluster-point").remove();
        textOverlay.html("");

        switch(slideIndex) {
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
        bicycleFatalities = crashData.filter(d => +d.FATAL_COUNT > 0 && +d.BICYCLE_DEATH_COUNT > 0);
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
            .attr("fill", "yellow")
            .attr("opacity", 0)
            .transition()
            .duration(1000)
            .attr("opacity", 0.8);
    }

    function showDataQualityIssues() {
        textOverlay.html(`
            <h2>Data Quality Issues</h2>
            <p>1. Helmet data (PC_HLM_IND) has been removed from the dataset.</p>
            <p>2. Some bicycle fatalities are clustered at specific locations, possibly due to data collection limitations.</p>
        `)
        .transition()
        .duration(1000)
        .style("opacity", 1);

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
            .transition()
            .duration(1000)
            .attr("opacity", 0.8);

        // Add tooltips to clustered points
        svg.selectAll(".cluster-point")
            .append("title")
            .text(d => `Reported fatalities at this location: ${d.count}`);
    }

    // Initialize with the first slide
    showSlide(0);

    // Add click event to progress through slides
    d3.select("#visualization").on("click", () => {
        currentSlide = (currentSlide + 1) % 4;
        showSlide(currentSlide);
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

    yearSelect.on("change", function() {
        const selectedYear = this.value;
        crashData = phillyCSV.filter(d => d.CRASH_YEAR === selectedYear);
        showSlide(currentSlide);
    });
});