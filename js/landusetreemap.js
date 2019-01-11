var width = 960;
var height = 600;
var ratio = 2;
  
var viz = d3.select("#viz")
  .style("width", width + "px")
  .style("height", height + "px");

var colors = d3.scaleOrdinal()
    .range(["#9CCEF3", "#009CDF", "#0087BE", "#CFCF9F", "#B8B972", "#A2A448"])
    .domain(["Dierlijk-Buiten EU", "Dierlijk-EU", "Dierlijk-NL", "Plantaardig-Buiten EU", "Plantaardig-EU", "Plantaardig-NL"]);

var dierplant = {
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
    "vegi": "Plantaardig",
    "fris": "Plantaardig",
    "koffie": "Plantaardig",
    "alco": "Plantaardig"
}

var graspercs = {
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
  "vegi": 0,
  "fris": 0,
  "koffie": 0,
  "alco": 0
}

var catnamen = {
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
  "vegi": "Vegetarische producten, noten, peulvruchten",
  "fris": "Fris en sap",
  "koffie": "Koffie en thee",
  "alco": "Bier en wijn"
}

var tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

  d3.csv("data/treemapdata-2018-12-17-dranken.csv", function(data){
    data.forEach(function(d){
      d.oppervlakte = +d.Totopp;
      d.percgras = +d.Percgras;
    })

  function draw(data, width, height, ratio){

    var treemap = d3.treemap()
      .size([width, height])
      .paddingOuter(3)
      .tile(d3.treemapSquarify.ratio(ratio));

    var nest = d3.nest()
      .key(function(d){ return d.Categorie; })
      .key(function(d){ return d.Product; })
      .key(function(d){ return d.Locatie; })
      .rollup(function(leaves) {
        return d3.sum(leaves, function(d) {return parseFloat(d.oppervlakte);})
      });
    
    var root = d3.hierarchy({values: nest.entries(data)},function(d){ return d.values; })
      .sum(function(d){ return d.value; })
      .sort(function(a, b) { return b.height - a.height || b.value - a.value; });
    
    treemap(root);

    var productData = root.children[0].children.concat(root.children[1].children);

    //Lower level divs
    viz
      .selectAll(".node.low")
      .data(root.leaves())
      .enter().append("div")
      .attr("class", "node low")
      .style("left", function(d) { return d.x0 + "px"})
      .style("top", function(d) { return d.y0 + "px"})
      .style("width", function(d) { return d.x1 - d.x0 + "px"})
      .style("height", function(d) { return d.y1 - d.y0 + "px"})
      .style("background", function(d) { return colors(dierplant[d.parent.data.key] + "-" + d.data.key)})
      .style("opacity", 0);
      /*.on("mouseover", function(d) {
        d3.select(this)
            .style("stroke", "#00374D")
            .style("stroke-width", 1);
        tooltip
            .html(function(){
                return "<h2>" + catnamen[d.parent.data.key] + "</h2><p>NL: " + d.parent.data.values[2].value + "</p><p>EU: " + d.parent.data.values[1].value + "</p><p>Buiten EU: " + d.parent.data.values[0].value + "</p>";
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
      });*/

    //Higher level divs
    var highNodes = viz.selectAll(".node.high")
        .data(productData)
        .enter().append("div")
        .attr("class", "node high")
        .attr("id", function(d) { return d.data.key; })
        .style("left", function(d) { return d.x0 + "px"; })
        .style("top", function(d) { return d.y0 + "px"; })
        .style("width", function(d) { return d.x1 - d.x0 + "px"; })
        .style("height", function(d) { return d.y1 - d.y0 + "px"; })
        .style("background-color", function(d) { return colors(d.parent.data.key + "-EU"); })
        .on("mouseover", function(d) {
          d3.select(this)
              .style("stroke", "#00374D")
              .style("stroke-width", 1);
          tooltip
              .html(function(){
                  return "<h2>" + catnamen[d.data.key] + "</h2><p>Bouwland: " + Math.round(d.value * (100 - graspercs[d.data.key])/100) + "</p><p>Grasland: " + Math.round(d.value * graspercs[d.data.key]/100) + "</p>";
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

      highNodes.append("div")
        .attr("class", "node-label")
        .text(function(d) { return Math.round(d.value); });
    
    //Icons
    var iconSize = 160;
    var iconMargin = 20;
    function fitIcon(d){
        var size = iconSize;
        var heightSize = iconSize;
        var widthSize = iconSize;
        if(iconSize > d.y1 - d.y0){
            heightSize = d.y1 - d.y0 - 2*iconMargin;
        }
        if(iconSize > d.x1 - d.x0){
            widthSize = d.x1 - d.x0 - 2*iconMargin;
        }
        var newSize = d3.min([size, heightSize, widthSize]);
        if(newSize < 20){ newSize = 20; }
        if(d.y1 - d.y0 < 10 || d.x1 - d.x0 < 10){newSize = 0; }
        return newSize;
    }
    highNodes
        .append("span").attr("class", "imghelper");
    highNodes.append("img")
        .attr("src", function(d) { return "icons/" + d.data.key + ".svg"; })
        .style("height", function(d) { return fitIcon(d) + "px"; })
        .style("width", function(d) { return fitIcon(d) + "px"; });

      //Grassland
        highNodes.insert("div", "span")
          .attr("class", "node grass")
          .style("width", function(d){
            //check if horizontal or vertical
            if((d.x1 - d.x0)/(d.y1 - d.y0) < 1){ return (d.x1 - d.x0) + "px"; }
            else{
              var grasperc = graspercs[d.data.key];
              return ((d.x1 - d.x0)*grasperc/100) + "px";
            }
          })
          .style("height", function(d){
            if((d.x1 - d.x0)/(d.y1 - d.y0) < 1){
              var grasperc = graspercs[d.data.key];
              return ((d.y1 - d.y0)*grasperc/100) + "px";
            }
            else{ return (d.y1 - d.y0) + "px"; }
          })
          .style("background-color", "transparent");

  }

  //draw(data, document.getElementById("width").value, document.getElementById("height").value, document.getElementById("ratio").value);
  draw(data, 960, 600, 2);

  d3.select("#switch").on("change", function(){
    if(document.getElementById("switch").checked){
      d3.selectAll(".node.low").transition().duration(1000).style("opacity", 1);
      d3.selectAll(".node.high").transition().duration(1000).style("background-color", "rgba(0,0,0,0)");
      d3.selectAll(".node.grass").transition().duration(1000).style("opacity", 0);
      d3.select("#legend").transition().duration(1000).style("opacity", 1)
    };
    if(!document.getElementById("switch").checked){
      d3.selectAll(".node.low").transition().duration(1000).style("opacity", 0);
      d3.selectAll(".node.high").transition().duration(1000).style("background-color", function(d) { return colors(d.parent.data.key + "-EU"); });
      d3.selectAll(".node.grass").transition().duration(1000).style("opacity", 0.4);
      d3.select("#legend").transition().duration(1000).style("opacity", 0)
    };
  })

  d3.selectAll(".parameter")
    .on("change", function(){
      var width = document.getElementById("width").value;
      var height = document.getElementById("height").value;
      var ratio = document.getElementById("ratio").value;
      viz.selectAll("*").remove();
      d3.select(("#viz")).style("width", width + "px").style("height", height + "px");
      draw(data, width, height, ratio);
    })
});