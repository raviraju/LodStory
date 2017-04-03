define(['lib/jquery', 'lib/jqueryUI','eic/Logger'],
  function ($, jqueryUI, Logger) {
    "use strict";
    var logger = new Logger("Editing Node");
    
    function EditingNodes(controller, hashObj){
    	console.log("NOW WE START WITH EDITING THE NODES");
    	this.a = 10;
    	this.b = 3;
    	this._data_source = controller.generator.generators[1].generators;
    	this._path = hashObj.path;
    	this._Slide_Element_Collection = new Object();
    	this._Play_Sequence = [];
    	this._curNode = this._path[0];
    	this._hash = hashObj;
    	var self = this;
    	
    	this.add();
    	this.subtract();
    	
    	
    }
    
    EditingNodes.prototype = {
    	add: function(){
    		console.log("10+3", this.a + this.b);
    	},
    	subtract: function(){
    		console.log("10-3", this.a - this.b);
    	},
    	initElementCollection: function(){
    		var self = this;
    		console.log("Data_Source", this._data_source);
    		for(var i = 1; i < this._data_source.length; i++){
    			this._data_source[i].slide_order = [];
    			//this._data_source[i].prepare();
    			var slides = this._data_source[i].getSlides();
    			console.log("GET SLIDES: ", slides);
    			var img = slides.img;
    			var vid = slides.vid;
    			console.log("img", img);
    			console.log("vid", vid);
    			for (var j = 0; j < img.length; j++){
    				//console.log(img[j].slides_info.data);
    				this._Slide_Element_Collection[img[j].slide_info.data.url]=img[j].slide_info;
    			}
    			for (var k = 0; k < vid.length; k++){
    				this._Slide_Element_Collection[vid[k].slide_info.data.videoID]=vid[k].slide_info;
    			} 
    		}
    		//console.log("NODE NAV BTN: ", $("#nodeNavBar"));
    		
    		//$("#lastStep").click(function(){
    			console.log("NODE NAV BTN: ", $(".nodeNavBtn"));
	    		$(".nodeNavBtn").click(function(){
	    			console.log("BTN CLICK");
	    			self.restoreCurrentNode($(this).attr("order"));
	    			self.PrepareNode($(this).attr("order"));
	    		});
    		//});
    		
    		
    	},
    	restoreCurrentNode: function(n){
    		console.log("RESTORE NODE");
    		this._data_source[n-1].slide_order = this._Play_Sequence;
    		var slide_content = [];
    		console.log("THIS", this);
    		for (var i = 0; i < this._Play_Sequence.length; i++){
    			console.log(i, this._Play_Sequence[i]);
    			slide_content.push(this._Slide_Element_Collection[this._Play_Sequence[i]]);
    		}
    		console.log("slide_content", slide_content);
    		this._curNode.slide_description = slide_content;
    		
    		console.log("Updated Hash", this._hash);
    	},
    	PrepareNode: function(n){
    		console.log("PREPARE NODE");
    		//this.grabMovieNav();
    		this._curNode = this._path[2*(n-1)];
    		this._Play_Sequence = this._data_source[n].slide_order;
    	},
    	EnableUIAnimation: function(){
    		var self = this;
    		console.log("UI Animation");
    		$( ".node-element-list" ).sortable({
			  connectWith: "#movie-nav-bar",
			  helper: "clone",
		      appendTo: "#videoEditor",
		      revert: true,
		      scroll: false,
		      receive: function(event, ui){
		      	ui.item.removeClass("movieNavElementWrap")
					   .addClass("nodeElementBarContentWrap")
		      }
		      // drag: function(event, ui){
		      	// ui.helper.css({
		      		// "width":$(this).css("width"),
		      		// "height":$(this).css("height")
		      	// });
		      // }
		    });
		    
		    $("#movie-nav-bar").sortable({
				connectWith: ".node-element-list",
				helper:"clone",
				appendTo:"#videoEditor",
				revert: true,
				scroll: false,
				over: function(event, ui){
					$("#movie-nav-bar").css("background", "yellow");
				},
				out: function(event, ui){
					$("#movie-nav-bar").css("background", "grey");
				},
				receive: function(event, ui){
					console.log("Receive!");
					ui.item.removeClass("nodeElementBarContentWrap")
						   .addClass("movieNavElementWrap")
				},
				update: function(event, ui){
					console.log("Update!");
					console.log("self", self);
					self.grabMovieNav();
				}
			});
			$( "#movie-nav-bar, .node-element-list" ).disableSelection();
    	},
    	grabMovieNav: function(){
    		var movieNav = $("#movie-nav-bar .nodeElementBarContent");
    		console.log(movieNav);
    		var navlist = [movieNav.length];
    		 for (var i = 0; i<movieNav.length; i++){
    			 navlist[i] = movieNav[i].src;
    		 }
    		console.log("Movie Nav: ", navlist);
    		this._Play_Sequence = navlist;
    	}
    	
    };


    return EditingNodes;
  });