var m = [20, 120, 20, 120],
   // w = 1280 - m[1] - m[3],
    w = 100,
    h = 580,
    i = 0,
    duration = 1,
    root,
    appendList = [];
var draw = document.getElementById("draw");
var input = document.getElementById("input");



var tree = d3.layout.tree()
	.size([h, w]);
    //.size([h, w - 100]);
 
var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });
 
var vis = d3.select("#chart").append("svg:svg")
    .attr("width", w + 100)
    .attr("height", h )
  	.append("svg:g")
    .attr("transform", "translate(40,0)");




function add(name, depthVal, situation) {
	var keyWord = "data_json/";
	keyWord += name;
	keyWord += ".json";

	
	d3.json(keyWord, function(json){
		json.x0 = 800;
  		json.y0 = 0;
		if (json != null){
			if (appendList[0] == undefined){
				history = json;
				appendList.push(json);
				for (var i = 0; i < json.children.length; i++){
					json.children[i].level = 1;
					appendList.push(json.children[i]);
				}
			}
			else {
				for (var i = 0; i < json.children.length; i++){
					appendList.push(json.children[i]);
				}
				for (var i = 0; i < appendList.length; i++){
					if (name == appendList[i].name){
						appendList[i].children = json.children;
					}
				}
			}
			for (var i = 0; i < appendList.length; i++){
				if (appendList[i].children != undefined){
					appendList[i].search = 1;
				}
				else {
					appendList[i].search = 0;
				}
			}
			console.log("history test: ", history);
			root = jQuery.extend(true, {}, history);
			var draw = update(root, depthVal, situation);
		}
		else {
			alert("no available data for ' " + name + " '");
		}

	});
console.log("===========================================================");
}







function update(source, level, situation) { 
	console.log("source: ", source);
	  // Compute the new tree layout.
	  if (situation == 1){
	  	if( (level + 1) * 100 >= w){
	  		w = (level + 1) * 100;
	  	}
	  }
	  else if (situation == 2){
	  	if ( (level + 1) * 100 >= w ){
	  		w = level * 100;
	  	}
	  }
	  console.log("w", w);
	  tree.size([h, w]);
	  $("svg").attr("width", w + 180);
	  
	  var nodes = tree.nodes(root).reverse();
	  // Update the nodes…
	  	var node = vis.selectAll("g.node")
	      .data(nodes, function(d) { return d.id || (d.id = ++i); });
	 
		var nodeEnter = node.enter().append("svg:g")
	    	.attr("class", "node")
	    	.attr("transform", function(d) { 
	    		console.log(d);
	    		return "translate(" + source.y0 + "," + source.x0 + ")"; 
	    	})
	    	.on("click", click)
	    	.on("mouseover", function(d){
	    		var output = nodeMouseOver(d.name, d.catalog);
	    	});
	    	//.style("opacity", 1e-6);
	 
	  // Enter any new nodes at the parent's previous position.
	 
	  	nodeEnter.append("svg:circle")
	      //.attr("class", "node")
	      //.attr("cx", function(d) { return source.x0; })
	      //.attr("cy", function(d) { return source.y0; })
	      .attr("r", 4.7)
	      .style("fill", function(d) { return d.children || d._children ? "lightsteelblue" : "#fff"; });
	      
		
		nodeEnter.append("svg:text")
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
	      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
	      .style("opacity", 1e-6)
	      .remove();
	
	  // Update the links…
	  var link = vis.selectAll("path.link")
	      .data(tree.links(nodes), function(d) { return d.target.id; });
	 
	  // Enter any new links at the parent's previous position.
	  link.enter().insert("svg:path", "g")
	      .attr("class", function(d){
	      	if(d.source.children && d.target.children){
	      		return "link linkHighlight";
	      	}
	      	else {
	      		return "link";
	      	}
	      })
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
}//update
	 
	// Toggle children on click.
function click(d) {
	if (d.search == 1){		
		if (d.children) {
		  d._children = d.children;
		  d.children = null;
		  update(d, d.depth, 2);
		} else {
		  d.children = d._children;
		  d._children = null;
		  update(d, d.depth, 1);
		}
		//update(d);
	}
	else if (d.search == 0){
		add(d.name, d.depth, 1);
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

/*
d3.json("data_json/computer.json", function(json) {
  json.x0 = 800;
  json.y0 = 0;
  update(root = json);
  console.log("json", json);
  console.log("root", root);
});

*/
 
 
 
//d3.select(self.frameElement).style("height", "2000px");


draw.onclick = function(){
	var key = input.value;
	console.log(key);
	var newRoot = add(key, 0, 1);
}













