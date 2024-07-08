// Set up dimensions
const width = 960;
const height = 600;

// Create SVG
const svg = d3.select("#visualization")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Create a projection for Philadelphia
const projection = d3.geoMercator()
  .center([-75.1652, 39.9526])  // Philadelphia coordinates
  .scale(70000)
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// Load Philadelphia GeoJSON data and crash data
Promise.all([
  d3.json("assets/philadelphia-zipcodes.geojson"),
  d3.csv("path/to/crash_data.csv")
]).then(([phillyMap, crashData]) => {
  // Filter data for Philadelphia and calculate fatalities
  const phillyData = crashData.filter(d => d.COUNTY === "67");  // Assuming 67 is Philadelphia's county code
  const fatalitiesCount = phillyData.reduce((sum, d) => sum + +d.FATAL_COUNT, 0);

  // Draw the map
  svg.selectAll("path")
    .data(phillyMap.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "#ccc")
    .attr("stroke", "#fff");

  // Initial slide
  showSlide(1);

  function showSlide(slideNumber) {
    svg.selectAll(".slide").remove();

    switch(slideNumber) {
      case 1:
        svg.append("text")
          .attr("class", "slide")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .text(`In 2023, there were ${fatalitiesCount} traffic fatalities in Philadelphia`);
        break;
      case 2:
        // Show fatalities by zip code (you'll need to aggregate data by zip code)
        // This is a placeholder for the actual implementation
        svg.selectAll("path")
          .attr("fill", d => {
            // You would calculate this based on fatalities in each zip code
            return d3.interpolateReds(Math.random());  // Placeholder
          });
        break;
      case 3:
        // Show hotspots or particularly dangerous intersections
        // This is a placeholder for the actual implementation
        svg.selectAll("circle")
          .data(phillyData.filter(d => +d.FATAL_COUNT > 0))
          .enter()
          .append("circle")
          .attr("class", "slide")
          .attr("cx", d => projection([d.DEC_LONG, d.DEC_LAT])[0])
          .attr("cy", d => projection([d.DEC_LONG, d.DEC_LAT])[1])
          .attr("r", 5)
          .attr("fill", "red");
        break;
      default:
        // Allow user interaction
        // You could add click events on zip codes to show detailed information, etc.
        break;
    }
  }

  // Navigation controls
  d3.select("#next").on("click", () => {
    currentSlide = Math.min(currentSlide + 1, 4);
    showSlide(currentSlide);
  });

  d3.select("#prev").on("click", () => {
    currentSlide = Math.max(currentSlide - 1, 1);
    showSlide(currentSlide);
  });

  let currentSlide = 1;
});
