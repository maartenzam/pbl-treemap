let filtereddata;

let width = 960,
    height = 960;
  
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
  .attr("height", height);

let t = textures.lines()
  .orientation("6/8")  
  .thicker()
  .lighter()
  .stroke("#ffffff");

let s = textures.lines()
  .orientation("2/8","6/8")  
  .thicker()
  .lighter()
  .stroke("#ff0000");

let sgreen = textures.lines()
  .orientation("2/8", "6/8")  
  .thicker()
  .lighter()
  .stroke("#00ff00");

let antique = ["#855C75","#D9AF6B","#AF6458","#736F4C","#526A83","#625377","#68855C","#9C9C5E","#A06177","#8C785D","#467378","#7C7C7C"]
let prism = ["#5F4690","#1D6996","#38A6A5","#0F8554","#73AF48","#EDAD08","#E17C05","#CC503E","#94346E","#6F4070","#994E95","#666666"]
let bold = ["#7F3C8D","#11A579","#3969AC","#F2B701","#E73F74","#80BA5A","#E68310","#008695","#CF1C90","#f97b72","#4b4b8f","#A5AA99"]

var color = d3.scaleOrdinal()
    .range(bold);

d3.csv("data/treemapdata.csv").then(function(data){

  data.forEach(function(d){
    d.oppervlakte = +d.Waarde;
  })
  filtereddata = data;

  function draw(filterdata, width, height){
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
      .padding(1)
      .round(true)
      .tile(d3.treemapSquarify.ratio(3));

    svg.call(t);
    //svg.selectAll("defs pattern path").attr("opacity", 0.5);
    svg.call(s);
    svg.call(sgreen); 

    let nest = d3.nest()
      .key((d) => d.Product)
      .key((d) => d.Locatie)
      .rollup(function(leaves) {
              return d3.sum(leaves, function(d) {return parseFloat(d.oppervlakte);})
          });

    let root = d3.hierarchy({values: nest.entries(filterdata)},(d) => d.values)
      .sum((d) => d.value)
      .sort(function(a, b) { return b.height - a.height || b.value - a.value; });

    treemap(root);
    let nodes = svg
      .selectAll(".node")
      .data(root.leaves())
      .enter().append("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);
  
    nodes.append("rect")
      .attr("class", "node")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .style("fill", function(d) { while (d.depth > 1) d = d.parent; return color(d.data.key); });

    //Agricultural area
    /*nodes.append("rect")
      .attr("width", function(d){
        //check if horizontal or vertical
        if((d.x1 - d.x0)/(d.y1 - d.y0) < 1){ return d.x1 - d.x0; }
        else{
          let agrperc = filterdata.filter(function(record){ return record.country == d.data.key })[0].agrpercent;
          return (d.x1 - d.x0)*agrperc/100;
        }
      })
      .attr("height", function(d){
        if((d.x1 - d.x0)/(d.y1 - d.y0) < 1){
          let agrperc = filterdata.filter(function(record){ return record.country == d.data.key })[0].agrpercent;
          return (d.y1 - d.y0)*agrperc/100;
        }
        else{ return d.y1 - d.y0; }
      })
      .style("fill", t.url())
      //.style("fill", "white")
      .style("opacity", 0.3);*/
    
      //Spared/extra land
    /*if(d3.select("#showspared").property("checked")){
      nodes.append("rect")
        .attr("x", function(d){
          let spared = filterdata.filter(function(record){ return record.country == d.data.key })[0].spared;
          let agrperc = filterdata.filter(function(record){ return record.country == d.data.key })[0].agrpercent;
          if((d.x1 - d.x0)/(d.y1 - d.y0) < 1){ return 0; }
          if((d.x1 - d.x0)/(d.y1 - d.y0) > 1 && spared > 0 ){ return (d.x1 - d.x0)*agrperc/100; }
          if((d.x1 - d.x0)/(d.y1 - d.y0) > 1 && spared < 0 ){ return (d.x1 - d.x0)*(parseFloat(agrperc) + parseFloat(spared))/100; }
        })
        .attr("y", function(d){
          let spared = filterdata.filter(function(record){ return record.country == d.data.key })[0].spared;
          let agrperc = filterdata.filter(function(record){ return record.country == d.data.key })[0].agrpercent;
          if((d.x1 - d.x0)/(d.y1 - d.y0) > 1){ return 0; }
          if((d.x1 - d.x0)/(d.y1 - d.y0) < 1 && spared > 0 ){ return (d.y1 - d.y0)*agrperc/100; }
          if((d.x1 - d.x0)/(d.y1 - d.y0) < 1 && spared < 0 ){ return (d.y1 - d.y0)*(parseFloat(agrperc) + parseFloat(spared))/100; }
        })
        .attr("width", function(d){
          //check if horizontal or vertical
          if((d.x1 - d.x0)/(d.y1 - d.y0) < 1){ return d.x1 - d.x0; }
          else{
            let spared = filterdata.filter(function(record){ return record.country == d.data.key })[0].spared;
            return Math.abs((d.x1 - d.x0)*spared/100);
          }
        })
        .attr("height", function(d){
          if((d.x1 - d.x0)/(d.y1 - d.y0) < 1){
            let spared = filterdata.filter(function(record){ return record.country == d.data.key })[0].spared;
            return Math.abs((d.y1 - d.y0)*spared/100);
          }
          else{ return d.y1 - d.y0; }
        })
        .style("fill", function(d){
          return "white";
          //return t.url();
        })
        .style("opacity", function(d){
          let spared = filterdata.filter(function(record){ return record.country == d.data.key })[0].spared;
          if(spared > 0){
            return 0.7;
          }
          if(spared <= 0){
            return 0.5;
          }
        });
      }*/

  
   let labels = nodes.append("text")
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
    });
    let labelsFirstLevel = svg.selectAll("text.label-first-level").data(root.children)
      .enter().append("g")
      .attr("class", "label-first-level")
      .attr("transform", (d) => `translate(${d.x0 + (d.x1 - d.x0)/ 2}, ${d.y0 + (d.y1 - d.y0)/ 2})`);
      /*.attr("x", function (d) {
            return (d.x1 - d.x0) / 2;
        })
        .attr("y", function (d) {
            return (d.y1 - d.y0) / 2;
        })*/
    let labelsFirstLevelText = labelsFirstLevel.append("text")
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
    });

  }

  draw(data, document.getElementById("width").value, document.getElementById("height").value);

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
      //testsvg.selectAll("*").remove();
      //testsvg.attr("width", width).attr("height", height);
      draw(filtereddata, width, height);
    })

});