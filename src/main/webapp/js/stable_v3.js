//DISABLE ANIMATION WHEN DISPLAYING NEW NODES

var m = [20, 120, 20, 120],
    w = 120,
    h = 580,
    i = 0,
    duration = 500,
    root,
    appendList = [];
var draw = document.getElementById("draw");
var input = document.getElementById("input");
var diagramDepth = 0, round = 1;
var appendMap = new Object();
var mainDepth = 1;
var tree = d3.layout.tree()
	.size([h, w]);
console.log(draw);
var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });
 
var vis = d3.select("#chart").append("svg:svg")
    .attr("width", w + 110)
    .attr("height", h )
  	.append("svg:g")
    .attr("transform", "translate(40,0)");

var chartHTML = '<div id="chart">';
 	chartHTML += '<div id="nodeInfo">';
	chartHTML += '<h3 id="info">Information</h3>';
	chartHTML += '<p class = "infoContent" id="name"> </p>';
	chartHTML += '<p class = "infoContent" id="catalog"> </p>';
	chartHTML += '<img id="stickyNote" src="img/stickyNotes.png" />';
	chartHTML += '</div></div>';

var searchBoxHTML = '<div id="searchBox">';
	searchBoxHTML += '<h1>Linked Data Education</h1>';
	searchBoxHTML += '<input id="input" />';
	searchBoxHTML += '<button id="draw">Draw</button>';
	searchBoxHTML += '</div>';

var stickyNote ='<div id="nodeInfo">';
	stickyNote +='<h3 id="info">Information</h3>';
	stickyNote +='<p class = "infoContent" id="name"> </p>';
	stickyNote +='<p class = "infoContent" id="catalog"> </p>';
	stickyNote +='<img id="stickyNote" src="img/stickyNotes.png" />';
	stickyNote +='</div>';		    		


function add(name) {
	console.log("called add(); ==================================================");
	var keyWord = "data_json/";
	keyWord += name;
	keyWord += ".json";

	
	d3.json(keyWord, function(json){
		json.x0 = 800;
  		json.y0 = 0;
console.log("json: ", json);
		if (json){
			if (round == 1){
				history = json;
				appendMap[json.name] = json;
				appendMap[json.name].search = 1;
				console.log("appendMap", appendMap);
				for (var i = 0; i < json.children.length; i++){
					json.children[i].search = 0;
					json.children[i].children = null;
					appendMap[json.children[i].name] = json.children[i];
				}
			}
			else {
				appendMap[json.name].search = 1;
				appendMap[json.name].children = json.children;
				for (var i = 0; i < json.children.length; i++){
					json.children[i].search = 0;
					json.children[i].children = null;
					appendMap[json.children[i].name] = json.children[i];
				}
				console.log("appendMap", appendMap);
			}
			console.log("history test: ", history);
		//	root = jQuery.extend(true, {}, history);
			root = history;
			var draw = update(root);
		}
		else {
			alert("no available data for ' " + name + " '");
		}

	});
console.log("===========================================================");
}


function update(source) { 
	console.log("Called update(); ========================================");
	console.log("vis: ", vis);
	console.log("source: ", source);
	console.log("source-APPENDMAP: ", appendMap);
	
	if (round != 1){
		var getWidth = getTreeWidth(root);
	}
	round ++;

//highlight nodes and links
	var getHighlight = highlightPath();
	
	var nodes = tree.nodes(root).reverse();

// Update the nodes…
	var node = vis.selectAll("g.node")
	   .data(nodes, function(d) { return d.id || (d.id = ++i); });
	
	var nodeEnter = node.enter().append("svg:g")
	    .attr("class", "node")
	    .attr("transform", function(d) { 
	    	console.log("nodeEnter: ", d);
	    	return "translate(" + source.y0 + "," + source.x0 + ")"; 
	    })
	    .on("click", click)
	    .on("mouseover", function(d){
	   		var output = nodeMouseOver(d.name, d.catalog);
	    });	
			
// Enter any new nodes at the parent's previous position.
	nodeEnter.append("svg:circle")
	   	 	 .attr("r", 4.7)
	   		 .style("fill", function(d) { 
				 return d.children || d._children ? "lightsteelblue" : "#fff"; 
			 });
	      
	nodeEnter.append("svg:text")
			 .attr("class", "textNormal")
		     .attr("x", function(d) { return d.children || d._children ? 13 : 8; })
			 .attr("y", function(d){
				 	return d.children || d._children ? -13 : 0;
			 })
    		 .attr("dy", ".35em")
    		 .style("fill", function(d){
    		 	return d.children || d._children ? "#ffff00" : "#fff";
    		  })
      		 .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      		 .text(function(d) { return d.name; })

	nodeEnter.transition()
			 .duration(duration)
			 .attr("transform", function(d) {
				 if (d.depth > diagramDepth){
				 	 diagramDepth = d.depth;
				 }
				 return "translate(" + d.y + "," + d.x + ")"; 
			 })
	      	 .style("opacity", 1);
		
	node.transition()
	    .duration(duration)
	    .attr("transform", function(d) { 
	    	return "translate(" + d.y + "," + d.x + ")"; 
	    })
	    .style("opacity", 1);
	    
	 
	node.exit().transition()
	      .duration(duration)
	      .attr("transform", function(d) {
		    console.log("nodeRemove: ", d);
			return "translate(" + source.y + "," + source.x + ")"; 
			})
	      .style("opacity", 1e-6)
	      .remove();

		
// Update the links…
	var link = vis.selectAll("path.link")
	      		  .data(tree.links(nodes), function(d) { 
						return d.target.id; 
				  });
	
// Enter any new links at the parent's previous position.
	  link.enter().insert("svg:path", "g")
	      .attr("class", "link")
	      .attr("d", function(d) {
	        var o = {x: source.x0, y: source.y0};
	        return diagonal({source: o, target: o});
	      })
	      .transition()
	      .duration(duration)
	      .attr("d", diagonal);		  
		

	 
// Transition links to their new position.
	  link.transition()
	      .duration(duration)
	      .attr("d", diagonal);
	 
// Transition exiting nodes to the parent's new position.
	  link.exit().transition()
	      .duration(duration)
	      .attr("d", function(d) {
	        var o = {x: source.x, y: source.y};
	        return diagonal({source: o, target: o});
	      })
	      .remove();
	 
// Stash the old positions for transition.
	  nodes.forEach(function(d) {
	    d.x0 = d.x;
	    d.y0 = d.y;
	  });
console.log("===========================================================");
}//update
	 
// Toggle children on click.
function click(d) {
	if (d.search == 1){		
		if (d.children) {
		  d._children = d.children;
		  d.children = null;
		  
		  mainDepth = 0;
		  var getDepth = getTreeWidth(root);		
		  w = (mainDepth) * 120;
		  console.log("mainDepth: ", mainDepth, " , w: ", w);
		  tree.size([h, w]);
		  update(d);
		} else {
		  d.children = d._children;
		  d._children = null;
		  
		  mainDepth = 0;
		  var getDepth = getTreeWidth(root);
		  w = (mainDepth) * 120;
		  console.log("mainDepth: ", mainDepth, " , w: ", w);
		  $("svg").attr("width", w + 120 + "");
		  tree.size([h, w]);
		  update(d);
		}
	}
	else if (d.search == 0){
		mainDepth = 0;	
		var getDepth = getTreeWidth(root);
		w = (mainDepth + 1) * 120;
		console.log("mainDepth: ", mainDepth, " , w: ", w);
		$("svg").attr("width", w + 120 + "");
		tree.size([h, w]);
		add(d.name);
	}
}

function nodeMouseOver(name, catalog) {
	$("#name").empty();
	$("#catalog").empty();
	var nameContent = "Name: " + name;
	var catalogContent = "Catalog: " + catalog;
	$("#name").append(nameContent);
	$("#catalog").append(catalogContent);
}

function getTreeWidth(treeRoot){
	console.log("Root Test: ", root);
	if (treeRoot.children == null){
		if (treeRoot.depth > mainDepth){
			mainDepth = treeRoot.depth;
		}
	}
	else {
		for (var i = 0; i < treeRoot.children.length; i++){
			getTreeWidth(treeRoot.children[i]);
		}
	}
}

function highlightPath(){
	var allNodes = vis.selectAll("g.node");
	var allLinks = vis.selectAll("path.link");
	console.log("allNodes: ", allNodes);
	console.log("allLinks: ", allLinks);
	for (var i = 0; i < allNodes[0].length; i++){
		if (allNodes[0][i].__data__.search == 1){
			allNodes[0][i].childNodes[0].style.fill = "lightsteelblue";
			allNodes[0][i].childNodes[1].style.fill = "ffff00";
		}
	}
	for (var i = 0; i < allLinks[0].length; i++){
		if (allLinks[0][i].__data__.target.children != null & allLinks[0][i].__data__.source.children != null){
		//if (allLinks[0][i].__data__.target.search == 1 & allLinks[0][i].__data__.source.search == 1){
			allLinks[0][i].style.stroke = "#ff6600";
			allLinks[0][i].style.strokeWidth = "2.5px";
		}
		else {
			allLinks[0][i].style.stroke = "#ccc";
			allLinks[0][i].style.strokeWidth = "1.5px";
		}
	}
}
function beginSearch(){
	$("#searchBox").remove();
	$("#chart").append(stickyNote);
//	$("#infoContent").append(chartHTML);
}
function linkMouseOver(name1, name2){
	console.log(name1, name2);
}

draw.onclick = function(){
	var search = beginSearch();
	var key = input.value;
	console.log(key);
	var newRoot = add(key, 0, 1);
}













