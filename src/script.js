const width = 960*2;
const height = 600*2;

let phillyMap = d3.json("/assets/phillyRoads.json")
let phillyCSV = d3.csv("/assets/philly_crashes.csv")

const projection = d3.geoMercator()
    .center([-75.1652, 39.9526]) 
    .scale(70000)
    .translate([width / 2, height / 1.6]);

const path = d3.geoPath().projection(projection);

Promise.all([
    phillyMap,
    phillyCSV
]).then(([phillyMap, crashData]) => {

    const svg = d3.select("#visualization").append("svg")
        .attr("width", width)
        .attr("height", height);

    console.log(phillyMap)

    svg.selectAll("path")
        .data(phillyMap.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("width", width)  
        .attr("height", height);  
            


});
