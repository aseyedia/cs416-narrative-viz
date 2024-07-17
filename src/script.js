const width = 960 * 2;
const height = 600 * 2;

let phillyMap = d3.json("/assets/phillyRoads.json");
let phillyCSV = d3.csv("/assets/philly_crashes.csv");

Promise.all([phillyMap, phillyCSV]).then(([phillyMap, crashData]) => {
    const phillyCenter = [-75.1652, 39.9526];
    const scale = 75000;

    const projection = d3.geoMercator()
        .center(phillyCenter)
        .scale(scale)
        .translate([width / 3.9, height / 2]);

    const path = d3.geoPath().projection(projection);

    const svg = d3.select("#visualization").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .call(d3.zoom().on("zoom", function (event) {
            svg.attr("transform", event.transform);
        }))
        .append("g");

    // Draw the roads
    svg.selectAll("path.road")
        .data(phillyMap.features.filter(d => d.properties.highway))
        .enter()
        .append("path")
        .attr("class", "road")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", d => d.properties.highway === "residential" ? "grey" : "black")
        .attr("stroke-width", d => d.properties.highway === "residential" ? 0.5 : 2);

    let currentSlide = 0;
    let fatalCrashes, allCrashes;
    let heatmapInterval;

    function showSlide(slideIndex) {
        currentSlide = slideIndex;
        svg.selectAll(".crash-point, .slide-text").remove();
        if (heatmapInterval) clearInterval(heatmapInterval);

        switch(slideIndex) {
            case 0:
                showAllCollisions();
                break;
            case 1:
                showFatalities();
                break;
            case 2:
                showHeatmap();
                break;
        }
    }

    function showAllCollisions() {
        allCrashes = crashData;
        const collisionCount = allCrashes.length;
        svg.append("text")
            .attr("class", "slide-text")
            .attr("x", width / 4)
            .attr("y", 50)
            .attr("text-anchor", "middle")
            .attr("font-size", "24px")
            .text(`In 2023, there were ${collisionCount} traffic collisions in Philadelphia`);

        svg.selectAll(".crash-point")
            .data(allCrashes)
            .enter()
            .append("circle")
            .attr("class", "crash-point")
            .attr("cx", d => projection([+d.DEC_LONG, +d.DEC_LAT])[0])
            .attr("cy", d => projection([+d.DEC_LONG, +d.DEC_LAT])[1])
            .attr("r", 2)
            .attr("fill", "blue")
            .attr("opacity", 0.3);
    }

    function showFatalities() {
        fatalCrashes = crashData.filter(d => +d.FATAL_COUNT > 0);
        const fatalityCount = fatalCrashes.reduce((sum, d) => sum + +d.FATAL_COUNT, 0);

        svg.append("text")
            .attr("class", "slide-text")
            .attr("x", width / 4)
            .attr("y", 50)
            .attr("text-anchor", "middle")
            .attr("font-size", "24px")
            .text(`Of these, ${fatalityCount} resulted in fatalities`);

        svg.selectAll(".crash-point")
            .data(fatalCrashes)
            .enter()
            .append("circle")
            .attr("class", "crash-point")
            .attr("cx", d => projection([+d.DEC_LONG, +d.DEC_LAT])[0])
            .attr("cy", d => projection([+d.DEC_LONG, +d.DEC_LAT])[1])
            .attr("r", 4)
            .attr("fill", "red")
            .attr("opacity", 0.6);
    }

    function showHeatmap() {
        let currentHour = 0;
        const hourlyData = d3.range(24).map(() => ({ collisions: [], fatalities: [] }));

        allCrashes.forEach(crash => {
            const hour = +crash.HOUR_OF_DAY;
            hourlyData[hour].collisions.push(crash);
            if (+crash.FATAL_COUNT > 0) {
                hourlyData[hour].fatalities.push(crash);
            }
        });

        function updateHeatmap() {
            svg.selectAll(".crash-point").remove();
            svg.selectAll(".slide-text").remove();

            svg.append("text")
                .attr("class", "slide-text")
                .attr("x", width / 4)
                .attr("y", 50)
                .attr("text-anchor", "middle")
                .attr("font-size", "24px")
                .text(`Collisions and Fatalities at ${currentHour}:00`);

            const hourData = hourlyData[currentHour];

            // Plot collisions
            svg.selectAll(".collision-point")
                .data(hourData.collisions)
                .enter()
                .append("circle")
                .attr("class", "crash-point")
                .attr("cx", d => projection([+d.DEC_LONG, +d.DEC_LAT])[0])
                .attr("cy", d => projection([+d.DEC_LONG, +d.DEC_LAT])[1])
                .attr("r", 3)
                .attr("fill", "blue")
                .attr("opacity", 0.3);

            // Plot fatalities
            svg.selectAll(".fatality-point")
                .data(hourData.fatalities)
                .enter()
                .append("circle")
                .attr("class", "crash-point")
                .attr("cx", d => projection([+d.DEC_LONG, +d.DEC_LAT])[0])
                .attr("cy", d => projection([+d.DEC_LONG, +d.DEC_LAT])[1])
                .attr("r", 5)
                .attr("fill", "red")
                .attr("opacity", 0.6);

            currentHour = (currentHour + 1) % 24;
        }

        updateHeatmap();
        heatmapInterval = setInterval(updateHeatmap, 1000); // Change every second
    }

    // Initialize with the first slide
    showSlide(0);

    // Add click event to progress through slides
    d3.select("#visualization").on("click", () => {
        currentSlide = (currentSlide + 1) % 3;
        showSlide(currentSlide);
    });

    // Add instructions text
    d3.select("#visualization")
        .append("text")
        .attr("x", width - 20)
        .attr("y", height - 20)
        .attr("text-anchor", "end")
        .attr("font-size", "16px")
        .text("Click anywhere to proceed");
});