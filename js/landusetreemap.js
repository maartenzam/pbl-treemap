let filtereddata;

let width = 960,
    height = 600;
  
let layout = [
  {
    "continent": "North America",
    "x": 0,
    "y": 0,
    "w": 0.3,
    "area": 0.600
  },
  {
    "continent": "South America",
    "x": 0.05,
    "y": 0.25,
    "w": 0.3,
    "area": 0.648
  },
  {
    "continent": "Europe",
    "x": 0.375,
    "y": 0,
    "w": 0.3,
    "area": 0.712
  },
  {
    "continent": "Africa",
    "x": 0.375,
    "y": 0.29,
    "w": 0.3,
    "area": 0.878
  },
  {
    "continent": "Asia",
    "x": 0.685,
    "y": 0,
    "w": 0.3,
    "area": 1
  },
  {
    "continent": "Oceania",
    "x": 0.75,
    "y": 0.45,
    "w": 0.2,
    "area": 0.273
  }
];
  
//Widths of continents are fixed, but the space they fill can be changed by scaling the heights with the scalefactor
let scalefactor = 0.18;
let margin = 5;
  
/*let testsvg = d3.select("#test")
  .attr("width", width)
  .attr("height", height);*/
  
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

  function draw(parent, filterdata, width, height){
    /*testsvg.append('rect')
      .attr("width", width)
      .attr("height", height)
      .style("fill", "lightblue")
    
    let continents = testsvg.selectAll('g').data(layout)
      .enter().append('g')
      .attr("transform", (d) => `translate(${margin + width * d.x},${margin + height * d.y * 100/65})`);
    continents.append('rect')
      .attr('width', (d) => width * d.w)
      .attr('height', (d) => height * d.area/d.w *  scalefactor)
      .attr("id", (d) => d.continent)
      .style("fill", "lightgreen")
      .style("opacity", 1)
      .style("stroke", "yellow")
      .style("stroke-width", 2);*/

    var treemap = d3.treemap()
      .size([width, height])
      .paddingOuter(3)
      //.round(true)
      .tile(d3.treemapSquarify.ratio(3));

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
      .style("fill", (d) => colors(dierplant[d.parent.data.key] + "-" + d.data.key))
      .on("mouseover", function(d) {
        d3.select(this)
            .style("stroke", "#00374D")
            .style("stroke-width", 1);
        tooltip
            .html(`<h2>${catnamen[d.parent.data.key]}</h2>
                <p>Locatie: ${d.data.key}</p>
                <p>Landgebruik: ${d.data.value} m2/persoon/jaar</p>`)
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
          let grasperc = filterdata.filter(function(record){ return record.Locatie == d.data.key && record.Product == d.parent.data.key; })[0].Percgras;
          //let agrperc = 40;
          return (d.x1 - d.x0)*grasperc/100;
        }
      })
      .attr("height", function(d){
        if((d.x1 - d.x0)/(d.y1 - d.y0) < 1){
          let grasperc = filterdata.filter(function(record){ return record.Locatie == d.data.key && record.Product == d.parent.data.key; })[0].Percgras;
          return (d.y1 - d.y0)*grasperc/100;
        }
        else{ return d.y1 - d.y0; }
      })
      .style("fill", "url('#diagonalHatch')")
      .style("opacity", 0.4)
      .style("pointer-events", "none");
  
   /*let labels = nodes.append("text")
      .attr("class", "node-label")
      .attr("x", function (d) {
            return (d.x1 - d.x0) / 2;
        })
        .attr("y", function (d) {
            return (d.y1 - d.y0) / 2;
        })
        .attr('dy', '.4em')
        .attr("text-anchor", "middle")
      .text((d) => d.data.key);

    labels.attr("transform", function(d){
        let bbox  = this.getBBox();
        if((d.x1  - d.x0) < bbox.width){
          let x = (d.x1 - d.x0) / 2;
          let y = (d.y1 - d.y0) / 2;
          return `rotate(90,${x},${y})`;
        }
        else{ return "rotate(0)"; }
      })

    labels.style("opacity", function(d){
        let bbox  = this.getBoundingClientRect();
        if((d.x1  - d.x0) < bbox.width || (d.y1  - d.y0) < bbox.height){
            return 0;
        }
    });*/
    
    //ICONS
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
        if(newSize < 20){newSize = 20; }
        return newSize;
    }
    if(parent == "viz"){
        labelsFirstLevel = svg.selectAll("image").data(root.children)
            .enter().append("image")
            .attr("href", (d) => "icons/" + d.data.key + ".svg")
            .attr("height", (d) => fitIcon(d))
            .attr("width", (d) => fitIcon(d))
            .attr("transform", (d) => `translate(${d.x0 + (d.x1 - d.x0)/ 2 - fitIcon(d)/2}, ${d.y0 + (d.y1 - d.y0)/ 2 - fitIcon(d)/2})`);
    }
    /*if(parent == "viz2"){
        labelsFirstLevel = svg2.selectAll("text.label-first-level").data(root.children)
            .enter().append("g")
            .attr("class", "label-first-level")
            .attr("transform", (d) => `translate(${d.x0 + (d.x1 - d.x0)/ 2}, ${d.y0 + (d.y1 - d.y0)/ 2})`);
    }*/

    /*let labelsFirstLevelText = labelsFirstLevel.append("text")
        .attr('dy', '.4em')
        .attr("text-anchor", "middle")
        .text((d) => d.data.key);

    labelsFirstLevelText.attr("transform", function(d){
        let bbox  = this.getBBox();
        if((d.x1  - d.x0) < bbox.width){
          let x = (d.x1 - d.x0) / 2;
          let y = (d.y1 - d.y0) / 2;
          //return `rotate(90,${x},${y})`;
          return `rotate(90,0,0)`;
        }
        else{ return "rotate(0)"; }
      })

    labelsFirstLevelText.style("opacity", function(d){
        let bbox  = this.getBoundingClientRect();
        if((d.x1  - d.x0) < bbox.width || (d.y1  - d.y0) < bbox.height){
            return 0;
        }
        else{return 0.5}
    });*/

  }

  draw("viz", data, document.getElementById("width").value, document.getElementById("height").value);
  //draw("viz2", data, document.getElementById("width").value, document.getElementById("height").value);

  /*d3.select("#continents")
		.on("change", function () {
      svg.selectAll("*").remove();
      let continent = d3.select(this).property('value')
      if(continent == "All"){
        filtereddata = data;
      }
      else{
        filtereddata = data.filter((d) => d.continent == continent);
      }
      draw(filtereddata, document.getElementById("width").value, document.getElementById("height").value);
  })
  
  d3.select("#showspared")
    .on("change", function() {
      svg.selectAll("*").remove();
      draw(filtereddata, document.getElementById("width").value, document.getElementById("height").value);
    });*/

  d3.selectAll(".slider")
    .on("change", function(){
      let width = document.getElementById("width").value;
      let height = document.getElementById("height").value;
      svg.selectAll("*").remove();
      svg.attr("width", width).attr("height", height);
      svg2.selectAll("*").remove();
      svg2.attr("width", width).attr("height", height);
      //testsvg.selectAll("*").remove();
      //testsvg.attr("width", width).attr("height", height);
      draw("viz", filtereddata, width, height);
      draw("viz2", filtereddata, width, height);
    })

});