// Constants and data loading
const width = 1920;
const height = 1200;

let phillyMap = d3.json("public/assets/phillyRoads.json");
let phillyCSV = d3.csv("public/assets/philly_crashes.csv");

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
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid black")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("pointer-events", "none");

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

    const sliderContainer = d3.select("#visualization")
        .append("div")
        .attr("class", "slider-container")
        .style("position", "absolute")
        .style("bottom", "20px")
        .style("left", "20px")
        .style("width", "300px")
        .style("display", "none");

    sliderContainer.append("input")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", 23)
        .attr("value", 0)
        .attr("id", "hourSlider");

    sliderContainer.append("span")
        .attr("id", "hourDisplay")
        .text("Hour: 0");

    const collisionTypeFilter = d3.select("#visualization")
        .append("select")
        .attr("id", "collisionTypeFilter")
        .style("position", "absolute")
        .style("bottom", "20px")
        .style("right", "20px")
        .style("display", "none");

    collisionTypeFilter.selectAll("option")
        .data(["All Collisions", "Fatalities", "Bicycle Fatalities", "Pedestrian Fatalities"])
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    // Draw roads
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
        svg.selectAll(".crash-point").remove();
        tooltip.style("opacity", 0);
        textOverlay.html("");

        sliderContainer.style("display", slideIndex === 5 ? "block" : "none");
        collisionTypeFilter.style("display", slideIndex === 5 ? "block" : "none");

        switch (slideIndex) {
            case 0: showIntroScene(); break;
            case 1: showAllCollisions(); break;
            case 2: showFatalities(); break;
            case 3: showBicycleFatalities(); break;
            case 4: showPedestrianFatalities(); break;
            case 5: showTimeAnalysis(); break;
        }
    }

    function showIntroScene() {
        const year = yearSelect.property("value");
        const totalFatalities = crashData.reduce((sum, d) => sum + (+d.FATAL_COUNT), 0);
        const pedestrianFatalities = crashData.reduce((sum, d) => sum + (+d.PED_DEATH_COUNT), 0);
        const bicycleFatalities = crashData.reduce((sum, d) => sum + (+d.BICYCLE_DEATH_COUNT), 0);
        const otherFatalities = totalFatalities - pedestrianFatalities - bicycleFatalities;

        let introText = `
            <h2>Philadelphia's Traffic Safety Crisis in ${year}</h2>
            <p>Philadelphia has one of the highest traffic death rates in the country, surpassing New York and Boston, and comparable to Los Angeles.</p>
            <p>In ${year}, Philadelphia saw ${totalFatalities} traffic fatalities:</p>
            <ul>
                <li>${pedestrianFatalities} were pedestrians</li>
                <li>${bicycleFatalities} were bicyclists</li>
                <li>${otherFatalities} were other traffic fatalities</li>
            </ul>
        `;

        if (year === "2023") {
            introText += `<p>Source: <a href="https://www.phillyvoice.com/philly-vision-zero-2023-report-traffic-deaths-vehicle-crashes-pedestrians/" target="_blank">PhillyVoice</a></p>`;
        }

        introText += `
            <br>
            <p>Click through the following scenes to explore Philadelphia's traffic collision data.</p>
            <p>Use the year dropdown at the top right to change the dataset.</p>
            <p><strong>Click anywhere to begin your exploration.</strong></p>
        `;

        introText += `<p>Source: <a href="https://crashinfo.penndot.pa.gov/PCIT/welcome.html" target="_blank">PennDOT Public Crash Database</a></p>`;

        textOverlay.html(introText)
            .transition()
            .duration(1000)
            .style("opacity", 1);
    }

    function showAllCollisions() {
        const year = yearSelect.property("value");
        const collisionCount = crashData.length;
        textOverlay.html(`<h2>In ${year}, there were ${collisionCount} traffic collisions in Philadelphia</h2>`)
            .transition()
            .duration(1000)
            .style("opacity", 1);

        createPoints(crashData, "blue", 2, 0.3);
    }

    function showFatalities() {
        const year = yearSelect.property("value");
        const fatalCrashes = crashData.filter(d => +d.FATAL_COUNT > 0);
        const fatalityCount = fatalCrashes.reduce((sum, d) => sum + (+d.FATAL_COUNT), 0);
        textOverlay.html(`<h2>In ${year}, ${fatalityCount} people lost their lives in ${fatalCrashes.length} fatal collisions</h2>`)
            .transition()
            .duration(1000)
            .style("opacity", 1);

        createPoints(fatalCrashes, "red", 4, 0.6);
    }

    function showBicycleFatalities() {
        const year = yearSelect.property("value");
        const bicycleFatalities = crashData.filter(d => +d.BICYCLE_DEATH_COUNT > 0);
        const bicycleFatalityCount = bicycleFatalities.reduce((sum, d) => sum + (+d.BICYCLE_DEATH_COUNT), 0);
        textOverlay.html(`<h2>In ${year}, ${bicycleFatalityCount} bicycle fatalities occurred in Philadelphia</h2>`)
            .transition()
            .duration(1000)
            .style("opacity", 1);

        createPoints(bicycleFatalities, "orange", 5, 0.8);
    }

    function showPedestrianFatalities() {
        const year = yearSelect.property("value");
        const pedestrianFatalities = crashData.filter(d => +d.PED_DEATH_COUNT > 0);
        const pedestrianFatalityCount = pedestrianFatalities.reduce((sum, d) => sum + (+d.PED_DEATH_COUNT), 0);
        textOverlay.html(`<h2>In ${year}, ${pedestrianFatalityCount} pedestrian fatalities occurred in Philadelphia</h2>`)
            .transition()
            .duration(1000)
            .style("opacity", 1);

        createPoints(pedestrianFatalities, "purple", 5, 0.8);
    }

    function showTimeAnalysis() {
        const year = yearSelect.property("value");
        textOverlay.html(`
            <h2>Analyze ${year} Crashes by Time of Day</h2>
            <p>Use the slider below to explore how crashes occur throughout the day.</p>
            <p>Change the collision type using the dropdown menu.</p>
        `)
        .transition()
        .duration(1000)
        .style("opacity", 1);

        updateVisualization();
    }

    function createPoints(data, color, radius, opacity, instant = false) {
        let points = svg.selectAll(".crash-point")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "crash-point")
            .attr("cx", d => projection([+d.DEC_LONG, +d.DEC_LAT])[0])
            .attr("cy", d => projection([+d.DEC_LONG, +d.DEC_LAT])[1])
            .attr("r", radius)
            .attr("fill", color)
            .on("mouseover", showTooltip)
            .on("mouseout", hideTooltip);

        if (instant) {
            points.attr("opacity", opacity);
        } else {
            points.attr("opacity", 0)
                .transition()
                .duration(1000)
                .attr("opacity", opacity);
        }
    }

    function showTooltip(event, d) {
        d3.select(this).attr("r", +this.getAttribute("r") + 2);
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(`Date: ${d.CRASH_MONTH}/${d.CRASH_YEAR}<br>
            Time: ${d.HOUR_OF_DAY}:00<br>
            Fatalities: ${d.FATAL_COUNT}<br>
            Bicycle Fatalities: ${d.BICYCLE_DEATH_COUNT}<br>
            Pedestrian Fatalities: ${d.PED_DEATH_COUNT}<br>
            Injuries: ${d.INJURY_COUNT}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    function hideTooltip() {
        d3.select(this).attr("r", this.getAttribute("r"));
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    function updateVisualization() {
        const hour = +d3.select("#hourSlider").property("value");
        const collisionType = d3.select("#collisionTypeFilter").property("value");

        let filteredData = crashData.filter(d => +d.HOUR_OF_DAY === hour);
        if (collisionType === "Fatalities") {
            filteredData = filteredData.filter(d => +d.FATAL_COUNT > 0);
        } else if (collisionType === "Bicycle Fatalities") {
            filteredData = filteredData.filter(d => +d.BICYCLE_DEATH_COUNT > 0);
        } else if (collisionType === "Pedestrian Fatalities") {
            filteredData = filteredData.filter(d => +d.PED_DEATH_COUNT > 0);
        }

        svg.selectAll(".crash-point").remove();
        createPoints(filteredData, d => {
            if (+d.BICYCLE_DEATH_COUNT > 0) return "orange";
            if (+d.PED_DEATH_COUNT > 0) return "purple";
            if (+d.FATAL_COUNT > 0) return "red";
            return "blue";
        }, 4, 0.6, true);

        d3.select("#hourDisplay").text(`Hour: ${hour}`);
    }

    // Event listeners
    d3.select("#visualization").on("click", (event) => {
        if (event.target.tagName !== "SELECT" && event.target.tagName !== "INPUT") {
            currentSlide = (currentSlide + 1) % 6;  // Changed to 6 for the new total number of slides
            showSlide(currentSlide);
        }
    });

    d3.select("#hourSlider").on("input", updateVisualization);
    d3.select("#collisionTypeFilter").on("change", updateVisualization);

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

    yearSelect.on("change", function() {
        crashData = filterDataByYear(this.value);
        showSlide(currentSlide);
    });

    // Initialize
    const mostRecentYear = years[years.length - 1];
    yearSelect.property("value", mostRecentYear);
    crashData = filterDataByYear(mostRecentYear);
    showSlide(0);
});