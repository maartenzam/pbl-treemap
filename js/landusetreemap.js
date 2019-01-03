let width = 960,
    height = 600,
    ratio = 2;
  
let viz = d3.select("#viz")
  .style("width", width + "px")
  .style("height", height + "px");

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

const graspercs = {
  "rundvlees": 73,
  "varkensvlees": 0,
  "zuivel": 53.92,
  "kip & ei": 0,
  "agf": 0,
  "vet & snack": 5.86,
  "dranken": 0,
  "brood & graan": 0,
  "zoet & gebak": 0,
  "vis": 0,
  "vegi": 0
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

  function draw(data, width, height, ratio){
    let switched = document.getElementById("switch").checked;

    var treemap = d3.treemap()
      .size([width, height])
      .paddingOuter(3)
      .tile(d3.treemapSquarify.ratio(ratio));

    let nest = d3.nest()
      .key((d) => d.Categorie)
      .key((d) => d.Product)
      .key((d) => d.Locatie)
      .rollup(function(leaves) {
        return d3.sum(leaves, function(d) {return parseFloat(d.oppervlakte);})
      });
    
    let root = d3.hierarchy({values: nest.entries(data)},(d) => d.values)
      .sum((d) => d.value)
      .sort(function(a, b) { return b.height - a.height || b.value - a.value; });
    
    treemap(root);

    let productData = root.children[0].children.concat(root.children[1].children);
    console.log(productData);

    //Higher level divs
    let highNodes = viz.selectAll(".node.high")
      .data(productData)
      .enter().append("div")
      .attr("class", "node high")
      .attr("id", (d) => d.data.key)
      .style("left", (d) => d.x0 + "px")
      .style("top", (d) => d.y0 + "px")
      .style("width", (d) => d.x1 - d.x0 + "px")
      .style("height", (d) => d.y1 - d.y0 + "px")
      .style("background", (d) => colors(d.parent.data.key + "-EU"));

    viz
      .selectAll(".node.low")
      .data(root.leaves())
      .enter().append("div")
      .attr("class", "node low")
      .style("left", (d) => d.x0 + "px")
      .style("top", (d) => d.y0 + "px")
      .style("width", (d) => d.x1 - d.x0 + "px")
      .style("height", (d) => d.y1 - d.y0 + "px")
      .style("background", (d) => {
          if(switched){return colors(dierplant[d.parent.data.key] + "-" + d.data.key);}
          else{return colors(dierplant[d.parent.data.key] + "-EU");}
      })
      .style("opacity", function(){
        if(switched){ return 1; }
        else{ return 0; }
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
    highNodes
        .append("span").attr("class", "imghelper");
    highNodes.append("img")
        .attr("src", (d) => "icons/" + d.data.key + ".svg")
        .style("height", (d) => fitIcon(d) + "px")
        .style("width", (d) => fitIcon(d) + "px");

        //Grassland

      viz.selectAll(".node.grass")
          .data(productData)
          .enter().append("div")
          .attr("class", "node grass")
          .style("left", (d) => d.x0 + "px")
          .style("top", (d) => d.y0 + "px")
          .style("width", function(d){
            //check if horizontal or vertical
            if((d.x1 - d.x0)/(d.y1 - d.y0) < 1){ return (d.x1 - d.x0) + "px"; }
            else{
              let grasperc = graspercs[d.data.key];
              return ((d.x1 - d.x0)*grasperc/100) + "px";
            }
          })
          .style("height", function(d){
            if((d.x1 - d.x0)/(d.y1 - d.y0) < 1){
              let grasperc = graspercs[d.data.key];
              return ((d.y1 - d.y0)*grasperc/100) + "px";
            }
            else{ return (d.y1 - d.y0) + "px"; }
          })
          .style("background-color", (d) => colors(d.parent.data.key + "-EU"));
        
    if(switched){
          d3.select("#legend").transition().duration(450).style("opacity", 1)
        }
    else{d3.select("#legend").transition().duration(450).style("opacity", 0);}
  }

  draw(data, document.getElementById("width").value, document.getElementById("height").value, document.getElementById("ratio").value);

  d3.selectAll(".parameter")
    .on("change", function(){
      let width = document.getElementById("width").value;
      let height = document.getElementById("height").value;
      let ratio = document.getElementById("ratio").value;
      viz.selectAll("*").remove();
      d3.select(("#viz")).style("width", width + "px").style("height", height + "px");
      draw(data, width, height, ratio);
    })
});