import * as d3 from 'd3';

const width = 960;
const height = 600;

const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoMercator()
    .center([-75.1652, 39.9526])
    .scale(70000)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

let currentSlide = 1;

Promise.all([
  d3.json("/philadelphia.geojson"),
  d3.csv("/philly_crashes.csv")
]).then(([phillyMap, crashData]) => {
    const phillyData = crashData.filter(d => d.COUNTY === "67");
    const fatalitiesCount = phillyData.reduce((sum, d) => sum + +d.FATAL_COUNT, 0);

    svg.selectAll("path")
        .data(phillyMap.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#ccc")
        .attr("stroke", "#fff");

    showSlide(1);

    d3.select("#next").on("click", () => {
        currentSlide = Math.min(currentSlide + 1, 3);
        showSlide(currentSlide);
    });

    d3.select("#prev").on("click", () => {
        currentSlide = Math.max(currentSlide - 1, 1);
        showSlide(currentSlide);
    });

    function showSlide(slideNumber) {
        d3.select("#info-panel").html("");
        switch(slideNumber) {
            case 1:
                d3.select("#info-panel").html(`<h2>Overview</h2><p>In 2023, there were ${fatalitiesCount} traffic fatalities in Philadelphia.</p>`);
                break;
            case 2:
                d3.select("#info-panel").html("<h2>Fatalities by Zip Code</h2><p>This slide would show a choropleth map of fatalities by zip code.</p>");
                break;
            case 3:
                d3.select("#info-panel").html("<h2>Dangerous Intersections</h2><p>This slide would highlight particularly dangerous intersections.</p>");
                break;
        }
    }
});
