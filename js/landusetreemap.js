let filtereddata;

let width = 960,
    height = 600,
    ratio = 2;
  
let svg = d3.select("#viz")
  .attr("width", width)
  .attr("height", height);

const colors = d3.scaleOrdinal()
    .range(["#9CCEF3", "#009CDF", "#0087BE", "#CFCF9F", "#B8B972", "#A2A448"])
    .domain(["Dierlijk-Buiten EU", "Dierlijk-EU", "Dierlijk-NL", "Plantaardig-Buiten EU", "Plantaardig-EU", "Plantaardig-NL"]);

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

d3.csv("data/treemapdata-2018-12-17.csv").then(function(data){

  data.forEach(function(d){
    d.oppervlakte = +d.Totopp;
    d.percgras = +d.Percgras;
  })
  dierData = data.filter(function(el){
    return el.Categorie == "Dierlijk";
  });
  plantData = data.filter(function(el){
    return el.Categorie == "Plantaardig";
  });

  function draw(animaldata, plantdata, width, height, ratio){
    animalToTotalRatio = 1944/(1944 + 1106);

    gLeft = svg.append("g");
    gRight = svg.append("g")
      .attr("transform", `translate(${width*animalToTotalRatio},0)`);

    var treemapLeft = d3.treemap()
      .size([width*animalToTotalRatio, height])
      .paddingOuter(3)
      .tile(d3.treemapSquarify.ratio(ratio));
    var treemapRight = d3.treemap()
      .size([width*(1-animalToTotalRatio), height])
      .paddingOuter(3)
      .tile(d3.treemapSquarify.ratio(ratio));

    let nest = d3.nest()
      .key((d) =>  d.Product)
      .key((d) => d.Locatie)
      .rollup(function(leaves) {
              return d3.sum(leaves, function(d) {return parseFloat(d.oppervlakte);})
          });
    
    let rootAnimals = d3.hierarchy({values: nest.entries(animaldata)},(d) => d.values)
      .sum((d) => d.value)
      .sort(function(a, b) { return b.height - a.height || b.value - a.value; });
    
    treemapLeft(rootAnimals);

    let rootPlants = d3.hierarchy({values: nest.entries(plantdata)},(d) => d.values)
      .sum((d) => d.value)
      .sort(function(a, b) { return b.height - a.height || b.value - a.value; });
    treemapRight(rootPlants);

    let nodesAnimals = gLeft
        .selectAll(".node")
        .data(rootAnimals.leaves())
        .enter().append("g")
        .attr("transform", (d) => `translate(${d.x0},${d.y0})`);
    let nodesPlants = gRight
        .selectAll(".node")
        .data(rootPlants.leaves())
        .enter().append("g")
        .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    nodesAnimals.append("rect")
      .attr("class", "node")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .style("fill", (d) => {
          return colors(dierplant[d.parent.data.key] + "-" + d.data.key);
      })
      .on("mouseover", function(d) {
        d3.select(this)
            .style("stroke", "#00374D")
            .style("stroke-width", 1);
        tooltip
            .html(function(){
                return `<h2>${catnamen[d.parent.data.key]}</h2>
                <p>Locatie: ${d.data.key}</p>
                <p>Landgebruik: ${d.data.value} m2/persoon/jaar</p>`;
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
    nodesPlants.append("rect")
    .attr("class", "node")
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .style("fill", (d) => {
        return colors(dierplant[d.parent.data.key] + "-" + d.data.key);
    })
    .on("mouseover", function(d) {
      d3.select(this)
          .style("stroke", "#00374D")
          .style("stroke-width", 1);
      tooltip
          .html(function(){
              return `<h2>${catnamen[d.parent.data.key]}</h2>
              <p>Locatie: ${d.data.key}</p>
              <p>Landgebruik: ${d.data.value} m2/persoon/jaar</p>`;
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
    nodesAnimals.append("rect")
      .attr("width", function(d){
        //check if horizontal or vertical
        if((d.x1 - d.x0)/(d.y1 - d.y0) < 1){ return d.x1 - d.x0; }
        else{
          let grasperc;
            grasperc = animaldata.filter(function(record){ return record.Locatie == d.data.key && record.Product == d.parent.data.key; })[0].Percgras;
          return (d.x1 - d.x0)*grasperc/100;
        }
      })
      .attr("height", function(d){
        if((d.x1 - d.x0)/(d.y1 - d.y0) < 1){
            grasperc = animaldata.filter(function(record){ return record.Locatie == d.data.key && record.Product == d.parent.data.key; })[0].Percgras;
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
        gLeft.selectAll("image").data(rootAnimals.children)
            .enter().append("image")
            .attr("href", (d) => "icons/" + d.data.key + ".svg")
            .attr("height", (d) => fitIcon(d))
            .attr("width", (d) => fitIcon(d))
            .attr("transform", (d) => `translate(${d.x0 + (d.x1 - d.x0)/ 2 - fitIcon(d)/2}, ${d.y0 + (d.y1 - d.y0)/ 2 - fitIcon(d)/2})`);
        gRight.selectAll("image").data(rootPlants.children)
            .enter().append("image")
            .attr("href", (d) => "icons/" + d.data.key + ".svg")
            .attr("height", (d) => fitIcon(d))
            .attr("width", (d) => fitIcon(d))
            .attr("transform", (d) => `translate(${d.x0 + (d.x1 - d.x0)/ 2 - fitIcon(d)/2}, ${d.y0 + (d.y1 - d.y0)/ 2 - fitIcon(d)/2})`);
  }

  draw(dierData, plantData, document.getElementById("width").value, document.getElementById("height").value);

  d3.selectAll(".parameter")
    .on("change", function(){
      let width = document.getElementById("width").value;
      let height = document.getElementById("height").value;
      let ratio = document.getElementById("ratio").value;
      svg.selectAll("*").remove();
      d3.select(("#viz")).attr("width", width).attr("height", height);
      draw("viz", filtereddata, width, height, ratio);
    })
});