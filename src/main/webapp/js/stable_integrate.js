//DISABLE ANIMATION WHEN DISPLAYING NEW NODES













var m = [20, 120, 20, 120],
    w = 150,
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
 
var userPath = [];
var userHash = new Object(); 
var keyWord
 
var vis = d3.select("#chart").append("svg:svg")
    .attr("width", w + 200)
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
	searchBoxHTML += '<button id="draw">Go</button>';
	searchBoxHTML += '</div>';

var stickyNote ='<div id="nodeInfo">';
	stickyNote +='<h3 id="info">Information</h3>';
	stickyNote +='<p class = "infoContent" id="name"> </p>';
	stickyNote +='<p class = "infoContent" id="catalog"> </p>';
	stickyNote +='<img id="stickyNote" src="img/stickyNotes.png" />';
	stickyNote +='</div>';

var redraw = '<button id="redraw">Start Over</button>';	
var finish = '<button id="finish">Proceed</button>';	    		
var relationBox = '<div id="relation" style="display: none;"></div>';
var firstNode = 'http%3A%2F%2Fdbpedia.org%2Fresource%2FBill_Clinton&num=5';
$("#chart").click(function(){
	$("#relation").empty();
});
function add(nodeURI, name) {
	console.log("called add(); ==================================================");
	var searchURI = "/Maven_DataVisualization-0.0.1-SNAPSHOT/rankServlet?uri=";
	searchURI += nodeURI;
	searchURI += '&num=7';

	// var searchURI = "../data_json/";
	// searchURI += name;
	// searchURI += ".json";

	d3.json(searchURI, function(json){
		//json.x0 = 800;
  		//json.y0 = 0;
console.log("json: ", json);
		if (json){
			if (round == 1){
				history = json;
				appendMap[keyWord] = json;
				appendMap[keyWord].name = name;
				appendMap[keyWord].search = 1;
				console.log("appendMap", appendMap);
				for (var i = 0; i < json.children.length; i++){
					json.children[i].search = 0;
					json.children[i].children = null;
					appendMap[json.children[i].name] = json.children[i];
				}
			}
			else {
				appendMap[name].search = 1;
				appendMap[name].children = json.children;
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
	   		var output = nodeMouseOver(d.name, d.relation);
	    });	
			
// Enter any new nodes at the parent's previous position.
	nodeEnter.append("svg:circle")
	   	 	 .attr("r", 5.5)
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
	      .attr("d", diagonal)
	      .attr("source", function(d){
	      	return d.source.name;
	      })
	      .attr("target", function(d){
	      	return d.target.name;
	      });		  
		

	 
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
	      
	$("path").on("mouseover", function(){
		var selected = linkMouseOver($(this).attr("source"), $(this).attr("target"));
		$(this).mousemove(function(e){
			var mouse = getMousePosition(e.pageX, e.pageY);
		})
	});
	
	
//highlight nodes and links
	var getHighlight = highlightPath();	 

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
		  w = (mainDepth) * 1;
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
		add(d.uri, d.name);
	}
	userPath = [];
	trackPath(d);
	console.log("HIGHLIGHTPATH: ", userPath);
}

function getMousePosition(x, y){
	console.log(x, y);
	$("#relation").css("top", y - 130 + "")
				  .css("left", x - 100 + "")
				  .css("display", "block");
	//$("#close").css("top", y - 10 + "");
			   
}


function nodeMouseOver(name, catalog) {
	$("#name").empty();
	$("#catalog").empty();
	var nameContent = "Name: " + name;
	var catalogContent = "Catalog: " + catalog;
	$("#name").append(nameContent);
	$("#catalog").append(catalogContent);
}

function linkMouseOver(source, target) {
	console.log(source, "~", target);
	$("#relation").empty();
	var relationContent = '<p id="relationContent">This is a relation between <b>' + source + '</b> and <b>' + target +'</b></p><h5 id="close" onclick = "removeRelation()">close</h5>';
	$("#relation").append(relationContent);
	$("#close").onclick = function(){
		$("#relationContent").remove();
		$(this).remove();
	}
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
		if (allLinks[0][i].__data__.target.children != null & allLinks[0][i].__data__.source.search == 1){
		//if (allLinks[0][i].__data__.target.search == 1 & allLinks[0][i].__data__.source.search == 1){
			allLinks[0][i].style.stroke = "#ff6600";
			allLinks[0][i].style.strokeWidth = "4.5px";
		}
		else {
			allLinks[0][i].style.stroke = "#ccc";
			allLinks[0][i].style.strokeWidth = "3px";
		}
	}
}
function trackPath(data) {
	userPath.unshift(data);
	if (data.parent != null){
		trackPath(data.parent);
	}
}
function generateHashObject(){
	userHash.hash = "h-3690378823082678040";
	//userHash.execution_time = 1220;
	//userHash.novelty = 0.11111111;
	//console.log("userPath", userPath);
	userHash.source = new Object();
	userHash.source.name = userPath[0].name;
	userHash.source.uri = userPath[0].uri;
	userHash.destination = new Object();
	userHash.destination.name = userPath[userPath.length - 1].name;
	userHash.destination.uri = userPath[userPath.length - 1].uri;
	userHash.path = [];
	for (var i = 0; i < userPath.length; i++){
		if (userPath[i].relation != "none"){
			var linktype = new Object;
			linktype.type = "link";
			linktype.inverse = true;
			linktype.uri = userPath[i].relation;
			userHash.path.push(linktype);
		}
		var nodetype = new Object;
		nodetype.type = "node";
		nodetype.name = userPath[i].name;
		nodetype.uri = userPath[i].uri;
		userHash.path.push(nodetype);
	}
	console.log(userHash);
}
function beginSearch(){
	$("#searchBox").remove();
	$("#chart").append(stickyNote);
	$("#contentWrap").append(redraw);
	$("#contentWrap").append(finish);
	$("#chart").append(relationBox);
	console.log(redraw);
	var endSearch = document.getElementById("redraw");
	endSearch.onclick = function(){
		location.reload();
	}
	$("#finish").click(function(){
		$("#contentWrap").html(JSON.stringify(userHash));
		$("#contentWrap").css("display", "none");
		$("chart").css("display", "none");
		$("#videoEditor").css("display", "block");
		console.log("userPath", userPath);
		generateHashObject();
		var controller = new PresentationController2(userHash);
		var view = new PiecesUI(controller);
		view.drawScreen($("#screen"));
		
	});
//	$("#infoContent").append(chartHTML);
}
function removeRelation(){
	$("#relation").empty();
	// $(this).remove();
}

// $("#chart").onclick = function(){
	// $("#relation").remove();
// }
draw.onclick = function(){
	var search = beginSearch();
	keyWord = input.value;
	console.log(keyWord);
	var newRoot = add(keyWord, keyWord);
}











