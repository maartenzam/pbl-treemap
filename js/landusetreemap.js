let filtereddata;

let width = 960,
    height = 600,
    ratio = 2;
  
let svg = d3.select("#viz")
  .attr("width", width)
  .attr("height", height)
  .append("g");

let svg2 = d3.select("#viz2")
  .attr("width", width)
  .attr("height", height);

const colors = d3.scaleOrdinal()
    .range(["#9CCEF3", "#009CDF", "#0087BE", "#CFCF9F", "#B8B972", "#A2A448"])
    .domain(["Dierlijk-NL", "Dierlijk-EU", "Dierlijk-Buiten EU", "Plantaardig-NL", "Plantaardig-EU", "Plantaardig-Buiten EU"]);

const dierplant = {
    "rundvlees": "Dierlijk",
    "varkensvlees": "Dierlijk",
    "zuivel": "Dierlijk",
    "kip & ei": "Dierlijk",
    "agf": "Plantaardig",
    "vet & snack": "Plantaardig",
    "dranken": "Plantaardig",
    "brood & graan": "Plantaardig",
    "zoet & gebak": "Plantaardig",
    "vis": "Dierlijk",
    "vegi": "Plantaardig"
}

const catnamen = {
  "rundvlees": "Rundvlees",
  "varkensvlees": "Varkensvlees",
  "zuivel": "Zuivel",
  "kip & ei": "Kippenvlees en eieren",
  "agf": "Aardappelen, groenten en fruit",
  "vet & snack": "Vetten, hartige sauzen, snacks",
  "dranken": "Dranken",
  "brood & graan": "Brood, graanproducten",
  "zoet & gebak": "Zoete producten en gebak",
  "vis": "Vis",
  "vegi": "Vegetarische producten, noten, peulvruchten"
}

var tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

d3.csv("data/treemapdata.csv").then(function(data){

  data.forEach(function(d){
    d.oppervlakte = +d.Totopp;
    d.percgras = +d.Percgras;
  })
  filtereddata = data;

  function draw(parent, filterdata, width, height, ratio){
    var treemap = d3.treemap()
      .size([width, height])
      .paddingOuter(3)
      .tile(d3.treemapSquarify.ratio(ratio));
    if(parent == "viz2"){
      treemap.paddingInner(1);
    }

    let nest = d3.nest()
      .key((d) => {
          if(parent == "viz"){return d.Product; }
          if(parent == "viz2"){return d.Locatie}
      })
      .key((d) =>{
        if(parent == "viz"){return d.Locatie; }
        if(parent == "viz2"){return d.Product}
    })
      .rollup(function(leaves) {
              return d3.sum(leaves, function(d) {return parseFloat(d.oppervlakte);})
          });

    let root = d3.hierarchy({values: nest.entries(filterdata)},(d) => d.values)
      .sum((d) => d.value)
      .sort(function(a, b) { return b.height - a.height || b.value - a.value; });

    treemap(root);

    let nodes;
    if(parent == "viz"){
        nodes = svg
            .selectAll(".node")
            .data(root.leaves())
            .enter().append("g")
            .attr("transform", (d) => `translate(${d.x0},${d.y0})`);
    }
    if(parent == "viz2"){
        nodes = svg2
            .selectAll(".node")
            .data(root.leaves())
            .enter().append("g")
            .attr("transform", (d) => `translate(${d.x0},${d.y0})`);
    }
    nodes.append("rect")
      .attr("class", "node")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .style("fill", (d) => {
        if(parent == "viz"){
          return colors(dierplant[d.parent.data.key] + "-" + d.data.key);
        }
        if(parent == "viz2"){
          return colors(dierplant[d.data.key] + "-" + d.parent.data.key);
        } 
      })
      .on("mouseover", function(d) {
        d3.select(this)
            .style("stroke", "#00374D")
            .style("stroke-width", 1);
        tooltip
            .html(function(){
              if(parent == "viz"){
                return `<h2>${catnamen[d.parent.data.key]}</h2>
                <p>Locatie: ${d.data.key}</p>
                <p>Landgebruik: ${d.data.value} m2/persoon/jaar</p>`;
              }
            if(parent == "viz2"){
              return `<h2>${catnamen[d.data.key]}</h2>
              <p>Locatie: ${d.parent.data.key}</p>
              <p>Landgebruik: ${d.data.value} m2/persoon/jaar</p>`;
            }
            })
            .transition()		
            .duration(200)		
            .style("opacity", 1)			
            .style("left", (d3.event.pageX + 28) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");	
        })
        .on("mousemove", function(d) {		
            tooltip	
                .style("left", (d3.event.pageX + 28) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            })					
      .on("mouseout", function(d) {	
        d3.select(this)
            .style("stroke-width", 0);	
        tooltip.transition()		
            .duration(500)		
            .style("opacity", 0);	
    });

    //Grassland
    nodes.append("rect")
      .attr("width", function(d){
        //check if horizontal or vertical
        if((d.x1 - d.x0)/(d.y1 - d.y0) < 1){ return d.x1 - d.x0; }
        else{
          let grasperc;
          if(parent == "viz"){
            grasperc = filterdata.filter(function(record){ return record.Locatie == d.data.key && record.Product == d.parent.data.key; })[0].Percgras;
          }
          if(parent == "viz2"){
            grasperc = filterdata.filter(function(record){ return record.Locatie ==  d.parent.data.key && record.Product == d.data.key; })[0].Percgras;
          }
          return (d.x1 - d.x0)*grasperc/100;
        }
      })
      .attr("height", function(d){
        if((d.x1 - d.x0)/(d.y1 - d.y0) < 1){
          if(parent == "viz"){
            grasperc = filterdata.filter(function(record){ return record.Locatie == d.data.key && record.Product == d.parent.data.key; })[0].Percgras;
          }
          if(parent == "viz2"){
            grasperc = filterdata.filter(function(record){ return record.Locatie ==  d.parent.data.key && record.Product == d.data.key; })[0].Percgras;
          }
          return (d.y1 - d.y0)*grasperc/100;
        }
        else{ return d.y1 - d.y0; }
      })
      .style("fill", "url('#diagonalHatch')")
      .style("opacity", 0.4)
      .style("pointer-events", "none");
    
    //Icons
    const iconSize = 160;
    const iconMargin = 20;
    function fitIcon(d){
        let size = iconSize;
        let heightSize = iconSize;
        let widthSize = iconSize;
        if(iconSize > d.y1 - d.y0){
            heightSize = d.y1 - d.y0 - 2*iconMargin;
        }
        if(iconSize > d.x1 - d.x0){
            widthSize = d.x1 - d.x0 - 2*iconMargin;
        }
        let newSize = d3.min([size, heightSize, widthSize]);
        if(newSize < 20){ newSize = 20; }
        if(d.y1 - d.y0 < 10 || d.x1 - d.x0 < 10){newSize = 0; }
        return newSize;
    }
    if(parent == "viz"){
        icons = svg.selectAll("image").data(root.children)
            .enter().append("image")
            .attr("href", (d) => "icons/" + d.data.key + ".svg")
            .attr("height", (d) => fitIcon(d))
            .attr("width", (d) => fitIcon(d))
            .attr("transform", (d) => `translate(${d.x0 + (d.x1 - d.x0)/ 2 - fitIcon(d)/2}, ${d.y0 + (d.y1 - d.y0)/ 2 - fitIcon(d)/2})`);
    }
    if(parent == "viz2"){
      icons = svg2.selectAll("image").data(root.leaves())
          .enter().append("image")
          .attr("href", (d) => "icons/" + d.data.key + ".svg")
          .attr("height", (d) => fitIcon(d))
          .attr("width", (d) => fitIcon(d))
          .attr("transform", (d) => `translate(${d.x0 + (d.x1 - d.x0)/ 2 - fitIcon(d)/2}, ${d.y0 + (d.y1 - d.y0)/ 2 - fitIcon(d)/2})`);
    }
  }

  draw("viz", data, document.getElementById("width").value, document.getElementById("height").value);
  draw("viz2", data, document.getElementById("width").value, document.getElementById("height").value);

  d3.selectAll(".parameter")
    .on("change", function(){
      let width = document.getElementById("width").value;
      let height = document.getElementById("height").value;
      let ratio = document.getElementById("ratio").value;
      svg.selectAll("*").remove();
      d3.select(("#viz")).attr("width", width).attr("height", height);
      svg2.selectAll("*").remove();
      d3.select(("#viz2")).attr("width", width).attr("height", height);
      draw("viz", filtereddata, width, height, ratio);
      draw("viz2", filtereddata, width, height, ratio);
    })
});