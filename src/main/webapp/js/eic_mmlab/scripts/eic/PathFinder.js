/*
* LODStory Path Finder
* Copyright 2014, LOD Story Team - University of Southern California - Information Sciences Institute
* Licensed under 
*/


define(['lib/jquery', 'eic/Logger', 'lib/d3','eic/PresentationController2','eic/PiecesUI', 'eic/SlideEditor', 'eic/Summarizer', 'eic/HashParser', 'config/URLs'],
  function ($, Logger, d3,PresentationController2, PiecesUI, SlideEditor, Summarizer, HashParser, urls) {
    "use strict";
    var logger = new Logger("PathFinder");
  		
    function PathFinder(options) {
    	/* Define HTML Elements*/
				
		/* Define Constants and Data */
        this.images = [];
		this.URLRef = new Object;
		this.w = 180;
    	this.h = 580;
    	this.i = 0;
    	this.url_ref = new Object;
    	this.duration = 500;
    	this.root = new Object;
    	this.appendList = [];
    	this.diagramDepth = 0;
    	this.round = 1;
		this.appendMap = new Object();
		this.mainDepth = 1;
		this.tree = new Object();
		this.diagnal = new Object;
		this.userPath = [];
		this.userHash = new Object(); 
		this.keyWord = '';	
		this.vis = new Object
		this.diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });		
//var tree = d3.layout.tree()
//	.size([h, w]);
		this.initLinkedDataEdu();
		
		this.movieOptions = options || {};
		
		//console.log(this);
    }

    /* Member functions */
    PathFinder.prototype = {
      // Starts the movie about the connection between the user and the topic.
      initLinkedDataEdu: function () {
		console.log("[===================Initialize Linked Data Edu App===================]");
		$("#liveSearchResult").html('');
		
      	var self=this;
      	$.getJSON('../data_json/uri_matching.json', function(data) {
      		self.url_ref = data;
      	});
      	$('#search').keyup(function() {
			var searchField = $('#search').val();
			if (searchField != "")
				$('#liveSearch').show();
			else
				$('#liveSearch').hide();
				
			var myExp = new RegExp(searchField, "i");
			
			
			var output = '<ul class="dropdown-menu" id="searchUpdate" role="menu" aria-labelledby="dropdownMenu1">';
			$.each(self.url_ref, function(key, val) {
				if ((val.name.search(myExp) != -1)) {
					output += '<li role="presentation"><a class="searchItem" role="menuitem" tabindex="-1" href="#">';
					output += val.name;
					
					output += '</li>';
				}
			});
			output += '</ul>';
			$('#liveSearch').html(output);
			$(".searchItem").click(function(){
				var uriMatch = $(this).html();
				$.each(self.url_ref, function(key, val) {
					if (val.name == uriMatch) {
						$("#liveSearchResult").html(val.uri);
					}
				});
				$('#search').val($(this).html());
				self.keyWord = $(this).html(); 
				$('#liveSearch').empty();
				$('#liveSearch').hide();
			});
		});
      	$("#searchButton").click(function(){
            var uriMatch = $('#search').val();
            $("#stepNavigator").css("display", "inline");
            $.each(self.url_ref, function(key, val) {
                if (val.name.toUpperCase() == uriMatch.toUpperCase()) {
                    $("#liveSearchResult").html(val.uri);
                }
            });
            self.keyWord = $('#search').val();
            $('#liveSearch').empty();
			if ($("#liveSearchResult").html()==='')		//Do not enter the path explorer page unless we actually have a uri
				return;
				
      		self.keyWord = $("#input").val();
      		self.addNode($("#liveSearchResult").html(), $("#search").val(), null);
      		$("#searchWindow").css("display", "none");
      		$("#canvasWindow").css("display", "block");
      		self.tree = d3.layout.tree().size([self.h, self.w]);
      		self.vis = d3.select("#chart").append("svg:svg")
					     .attr("width", self.w + 270)
					     .attr("height", self.h )
					  	 .append("svg:g")
					     .attr("transform", "translate(40,0)");
			
			$("#finish").click(function(){
				var progress = '<div class="progress progress-striped active canvas-alert"><div class="progress-bar progress-bar-success"  role="progressbar" aria-valuenow="100" aria-valuemin="1" aria-valuemax="100" style="width: 100%"><span class="sr-only">Generating Stories...</span></div></div>';
                $("#relation").remove();
				$("#stepNavigator").append(progress);
				/*Shift Screen*/
				self.generateHashObject();
				$("#canvasWindow").css("display", "none");
				$("#editor").css("display", "inline");
				$("#body").css("display", "block");
				
				/*Prepare Video Editor*/
				console.log(self.userHash);
				console.log(self.movieOptions);
            	var controller = new PresentationController2(self.userHash, self.movieOptions);
	            var view = new PiecesUI(controller);
	            view.initControls();
		        controller.once("slide_generation_finished", function(){
		        	$(".canvas-alert").remove();
					var editor = new SlideEditor(controller.generator, controller.path, controller, self.userHash);
		        });
            });
			$("#chart").click(function(){
				$("#relation").empty();
			});
			$(".redraw").click(function(){
				location.reload();
			});
      	});
      	
    },
    addNode: function(nodeURI, name, data_prev){    	
      	console.log("[===================Add New Node===================]");
      	console.log("nodeURI : " + nodeURI + " name : " + name );
      	var self = this;
		var progress = '<div class="progress progress-striped active canvas-alert"><div class="progress-bar"  role="progressbar" aria-valuenow="100" aria-valuemin="1" aria-valuemax="100" style="width: 100%"><span class="sr-only">Loading...</span></div></div>';
		$("#canvasStepNavigator").append(progress);
		console.log("get ranking results for : " + nodeURI);
  		$.ajax({
  			url: urls.ranking,
  			//contentType:"application/x-www-form-urlencoded; charset=UTF-8",
  			dataType: 'jsonp',
			data: {uri: nodeURI, num: 7},
			success: function(json){
				console.log("response : ", json);
				if (json){
				
					var info = {
						chosen: false
					};				

					if (self.round == 1){ // The Starting Node
						//console.log("first round");
						self.history = json;
						self.appendMap[name] = json;
						self.appendMap[name].name = name;
						self.appendMap[name].search = 1;
						self.appendMap[name].parent = null;
						
						self.root = self.history;
						self.updateCanvas(self.root);
					}
					else {
						//console.log("not first round");
						//console.log(data_prev);
						info.subject = HashParser.prototype.escapeString(data_prev.parent.uri);
                        for(var i = 0; i < data_prev.parent.children.length; i++){
                            //send to the data collector
                            info.object = HashParser.prototype.escapeString(data_prev.parent.children[i].uri);
                            info.predicate = HashParser.prototype.escapeString(data_prev.parent.children[i].relationship);
                            if(data_prev.parent.children[i].uri == data_prev.uri) 
                            	info.chosen = true;
                            else 
                            	info.chosen = false;
                            //console.log("trigger ajax to liveDemo to collect data without datatype");
                            $.ajax({
                               url: urls.livedemo,
                               type: "POST",
                               data:info,
                               success: function(response){
                            	   //console.log(response);
                               },
                               error: function(xhr, textStatus) {
                            	   console.log(xhr.responseText);
                               }
                            });
                        }

						self.userPath = [];
						self.trackPathParent(data_prev);
						var children = [];
						var newNodes=0;
						for (var i = 0; i < json.children.length; i++){
								json.children[i].search = 0;
								json.children[i].children = null;
								self.appendMap[json.children[i].name] = json.children[i];
								var flag = 0;
								
								//Used to avoid placing the node multiple times in the same path
								for (var j = 0; j < self.userPath.length; j++){
									if (json.children[i].name == self.userPath[j].name){
										flag = 1;
										break;
									}
								}
								
								//The child is unique. We can display it
								if (flag != 1){
									children.push(json.children[i]);
									newNodes++;
								}
						}
						
						data_prev.children = children;
						self.root = self.history;						
						
						self.updateCanvas(self.root);
						
						if (json.children.length == 0 || newNodes==0){
							var alert_msg = '<div class="alert alert-warning canvas-alert">There are no new links for ' + name +'.</div>';
							$("#canvasStepNavigator").append(alert_msg);
							$(".canvas-alert").fadeIn(100).delay(2500).slideUp(300);
							setTimeout(function(){
								$(".canvas-alert").remove();
							},4000);
						}						
					}	
				}
				else {
					var alert_msg = '<div class="alert alert-danger canvas-alert">Oooops, no available data for ' + name +'.</div>';
						$("#canvasStepNavigator").append(alert_msg);
						$(".canvas-alert").fadeIn(100).delay(2500).slideUp(300);
						setTimeout(function(){
							$(".canvas-alert").remove();
						},4000);
				}
			}
  		})
		
	},//addNode
	updateCanvas: function(source){
	 	$(".canvas-alert").remove();
	 	var self = this;
	 	
	 	if (self.round != 1){
			var getWidth = self.getTreeWidth(self.root);
		}
		self.round ++;
		//console.log("self.round : " + self.round);
		
		var nodes = self.tree.nodes(self.root).reverse();
	
	// Update the nodes…
		var node = self.vis.selectAll("g.node")
		   .data(nodes, function(d) { return d.id || (d.id = ++self.i); });
		
		var nodeEnter = node.enter().append("svg:g")
		    .attr("class", "node")
		    .attr("transform", function(d) { 
		    	return "translate(" + source.y0 + "," + source.x0 + 160 + ")"; 
		    })
		    .on("click", function(d){
		    	self.click(d);
		    });

	// Enter any new nodes at the parent's previous position.
		nodeEnter.append("svg:circle")
		   	 	 .attr("r", 7)
		   		 .style("fill", function(d) { 
					 return d.children || d._children ? "lightsteelblue" : "#fff"; 
				 });
		      
		nodeEnter.append("svg:text")
				 .attr("class", "textNormal")
			     .attr("x", function(d) { return d.children || d._children ? 70 : 8; })
				 .attr("y", function(d){
					 	return d.children || d._children ? 0 : 0;
				 })
	    		 .attr("dy", ".35em")
	    		 .style("fill", function(d){
	    		 	return d.children || d._children ? "#3399ff" : "#000";
	    		  })
	      		 .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
	      		 .text(function(d) {
	      		 	var name_data = "";
	      		 	if (d.name.length > 22) {
	      		 		for (var i = 0; i < 23; i++){
	      		 			name_data += d.name[i];
	      		 		}
	      		 		name_data += '...';
	      		 	}
	      		 	else {
	      		 		name_data = d.name;
	      		 	}
	      		 	return name_data; 
	      		 })
	
		nodeEnter.transition()
				 .duration(self.duration)
				 .attr("transform", function(d) {
					 if (d.depth > self.diagramDepth){
					 	 self.diagramDepth = d.depth;
					 }
					 return "translate(" + d.y + "," + d.x + ")"; 
				 })
		      	 .style("opacity", 1);
			
		node.transition()
		    .duration(self.duration)
		    .attr("transform", function(d) { 
		    	return "translate(" + d.y + "," + d.x + ")"; 
		    })
		    .style("opacity", 1);
		    
		 
		node.exit().transition()
		      .duration(self.duration)
		      .attr("transform", function(d) {
				return "translate(" + source.y + "," + source.x + ")"; 
				})
		      .style("opacity", 1e-6)
		      .remove();
	
			
	// Update the links…
		var link = self.vis.selectAll("path.link")
		      		  .data(self.tree.links(nodes), function(d) { 
							return d.target.id; 
					  });
		
	// Enter any new links at the parent's previous position.
		  link.enter().insert("svg:path", "g")
		      .attr("class", "link")
		      .attr("d", function(d) {
		        var o = {x: source.x0, y: source.y0};
		        return self.diagonal({source: o, target: o});
		      })
		      .transition()
		      .duration(self.duration)
		      .attr("d", self.diagonal)
		      .attr("source", function(d){
		      	return d.source.name;
		      })
		      .attr("target", function(d){
		      	return d.target.name;
		      })
		      .attr("id", function(d){
		      	return d.source.name+d.target.name;
		      })
		      .attr("relation", function(d){
		      	return d.target.relation;
		      })
		      .attr("inverse", function(d){
		      	return d.target.inverse;
		      });
			
	
		 
	// Transition links to their new position.
		  link.transition()
		      .duration(self.duration)
		      .attr("d", self.diagonal);
		 
	// Transition exiting nodes to the parent's new position.
		  link.exit().transition()
		      .duration(self.duration)
		      .attr("d", function(d) {
		        var o = {x: source.x, y: source.y};
		        return self.diagonal({source: o, target: o});
		      })
		      .remove();

		$("path").on('mouseover', function(){
			var selected = self.linkMouseOver($(this).attr("relation"), $(this).attr("inverse"), $(this).attr("source"), $(this).attr("target"));
			$(this).mousemove(function(e){
				var mouse = self.getMousePosition(e.pageX, e.pageY);
			})
		});

         $("path").on('mouseout', function(){
             $("#relation").remove();
         });
		
		
	//highlight nodes and links
		var getHighlight = self.highlightPath();
		self.emphasizeRecent();	 
	
	// Stash the old positions for transition.
		  nodes.forEach(function(d) {
		    d.x0 = d.x;
		    d.y0 = d.y;
		  });
		  
		  //"Refresh all nodes by hiding and showing them...seems to actualy fix whatever's wrong with the tree when it doesn't display
		  //For now, set to only refresh right after drawing the root, since that's the only time the chart actually fails to draw everything (timing issues?)
		  //Could set this to refresh on any updateCanvas, but the blinking is honestly rather ugly
		  self.getTreeWidth(self.root);
		if (self.mainDepth<2){
			window.setTimeout(function(){
				$("g").hide();
					window.setTimeout(function(){
						$("g").show();
				},100);
			},self.duration+500);
		}
		  
	 },//updateCanvas
     click: function(d) {	 
     	var self = this;
		//d.search is a boolean that determines whether or not the node has already been expanded
		if (d.search == 1){
			if (d.children) { //Collapses the node to hide its children
			  d._children = d.children;
			  d.children = null;
			  
			  self.mainDepth = 0;
			  var getDepth = self.getTreeWidth(self.root);		
			  self.w = (self.mainDepth) * 180 + 270;
			  self.tree.size([self.h, self.w - 270 + ""]);
			  self.userPath = [];
			  self.trackPathParent(d);
			} 
			else { //Expands the node to show its children
			  d.children = d._children;
			  d._children = null;
			  
			  self.mainDepth = 0;
			  var getDepth = self.getTreeWidth(self.root);
			  self.w = (self.mainDepth) * 180 + 270;
			  $("svg").attr("width", self.w);
			  self.tree.size([self.h, self.w - 270 + ""]);
			  self.userPath = [];
			  self.trackPathParent(d);
			}
			this.updateCanvas(d);
			
		}
		else{
			d.search = 1;
			//if ( self.appendMap[d.name].children == null){
				self.mainDepth = 0;	
				if (d.depth == self.diagramDepth){
					var getDepth = self.getTreeWidth(self.root);
					self.w = (self.diagramDepth + 1) * 180 + 270;
					$("svg").attr("width", self.w);
					self.tree.size([self.h, self.w - 270 + ""]);
				}
				//console.log(d.parent);
				self.checkRepetitive(d.parent, d.name, d);
		}		
			
	},
	getMousePosition: function(x, y){
	  $("#relation").css("top", y - 90 + "")
					.css("left", x - 100 + "")
					.css("display", "block");
	},
	linkMouseOver: function(relation, inverse, subject, object) {
		var id = "path[id='" + subject + object + "']";
		var d = $(id).attr("d");
		var relationContent = '<div id="relation" class="close" style="position: absolute; left:' + d + 'px; top:' + d + 'px;">';
		if(inverse == 1)
			relationContent += subject + relation + object;
		else
			relationContent += subject + relation + object;

		relationContent += '</div>';
		$('body').append(relationContent);
	},
	getTreeWidth: function(treeRoot){
		var self = this;
		if (treeRoot.children == null){
			if (treeRoot.depth > self.mainDepth){
				self.mainDepth = treeRoot.depth;
			}
		}
		else {
			for (var i = 0; i < treeRoot.children.length; i++){
				self.getTreeWidth(treeRoot.children[i]);
			}
		}
	},
	highlightPath: function(){
		var self = this;
		
		var allNodes = self.vis.selectAll("g.node");
		var allLinks = self.vis.selectAll("path.link");
		for (var i = 0; i < allNodes[0].length; i++){
			if (allNodes[0][i].__data__.children != null){
				allNodes[0][i].childNodes[0].style.fill = "lightsteelblue";
				allNodes[0][i].childNodes[1].style.fill = "33ADFF";
			}
		}
		for (var i = 0; i < allLinks[0].length; i++){
			if (allLinks[0][i].__data__.target.children != null & allLinks[0][i].__data__.source.children != null){
				allLinks[0][i].style.stroke = "#4747d1";
				allLinks[0][i].style.strokeWidth = "4.5px";
			}
			else {
				allLinks[0][i].style.stroke = "#ccc";
				allLinks[0][i].style.strokeWidth = "3px";
			}
		}
		
	},
	emphasizeRecent: function(){
		var self=this;
		var allLinks = self.vis.selectAll("path.link");
		for (var i = 0; i < self.userPath.length-1; i++){
			var linkSearch = self.userPath[i].name + self.userPath[i+1].name;
			for (var j = 0; j < allLinks[0].length; j++){
				if (allLinks[0][j].id == linkSearch) {
					allLinks[0][j].style.stroke = "#ff6600";
				}
			}
		}
	},
	trackPathParent: function(data) {
		var self = this;
		self.userPath.unshift(data);
		
		if (data.parent != null){
			self.trackPathParent(data.parent);
		}
	},
	checkRepetitive: function(data, name, node) {
		var self = this;
		if (data.name == name){
			var alert_msg = '<div class="alert alert-warning canvas-alert">This node has already been explored in this path, please try other nodes. <b>If you want to include the repeated node in your story, please click it again</b></div>';
				$("#canvasStepNavigator").append(alert_msg);
				$(".canvas-alert").fadeIn(100).delay(2500).slideUp(300);
				setTimeout(function(){
					$(".canvas-alert").remove();
				},4000);
				self.userPath = [];
				self.trackPathParent(data);
		}
		else {
			if (data.parent != null){
				self.checkRepetitive(data.parent, name, node);
			}else{
				self.addNode(node.uri, node.name,node);
			}
		}
	},
	trackPathChildren: function(data) {
		var self = this;
		// for(var i = 0; i < data.children.length; i++){
			// if (data.children.)
		// }
	},
	generateHashObject: function(){
		var self = this;
		
		console.log("userPath:");
		console.log(self.userPath);
		
		self.userHash.source = new Object();
		self.userHash.source.name = self.userPath[0].name;
		self.userHash.source.uri = self.userPath[0].uri;
		self.userHash.destination = new Object();
		self.userHash.destination.name = self.userPath[self.userPath.length - 1].name;
		self.userHash.destination.uri = self.userPath[self.userPath.length - 1].uri;
		self.userHash.path = [];
		for (var i = 0; i < self.userPath.length; i++){
			if (self.userPath[i].relation != "none"){
				var linktype = new Object;
				linktype.type = "link";
				if (self.userPath[i].inverse == 1){
					linktype.inverse = true;
				}else {
					linktype.inverse = false;
				}
				linktype.name = self.userPath[i].relationship;
				linktype.relationString = self.userPath[i].relation;
				self.userHash.path.push(linktype);
			}

			var nodetype = new Object;
			nodetype.type = "node";
			nodetype.name = self.userPath[i].name;
			nodetype.uri = self.userPath[i].uri;
            nodetype.image = self.userPath[i].image;
			self.userHash.path.push(nodetype);
		}
		
		//Focus is through the objects, hence why we start at i=2 (0=subject, 1=predicate, 2=object)
		for (var i=2; i<self.userHash.path.length; i=i+2){
			var info = {
				chosen: true
			}
			
			info.subject = self.userHash.path[i-2].uri;
			info.predicate = self.userHash.path[i-1].name;
			info.object = self.userHash.path[i].uri;
			
			$.ajax({
				url: urls.livedemo,
				type: "POST",
				data:info,
				success: function(response){
             	   //console.log(response);
                },
				error: function(xhr, textStatus) {
					console.log(textStatus);
					//console.log(xhr.responseText);
				}
			});
		}
		
		console.log(self.userHash);
	}
};

    return PathFinder;
});
