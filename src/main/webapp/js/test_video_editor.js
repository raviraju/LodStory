var HashObject, dataPathHash = Object;

$.getJSON("../data_json/sample_path.json", function(data){
	var HashObject = data;
	console.log("hash_object", HashObject);
});

$("#generateVideoEditor").click(function(){
	$(this).remove();
	$("#nodeNavBar").css("display","block");
	$("#nodeElementBar").css("display", "block");
	$("#moviePreview").css("display", "block");
	$("#textDescription").css("display", "block");
	$("#movieNavBarWrap").css("display", "block");
	$("#stepNavigator").css("display", "block");
	$("#nodeElementOperation").css("display", "block");
	$(".slideProgressBar").css("display", "block");
	
	generateVideoEditor();
	
	enableCSSResponse();
	
	enableNodeOperation()
	
	
	
});

function generateNodeNavBar(){
	var NodeNavBar = "<ul class='nav nav-pills nav-justified'>";
//	NodeNavBar += "<li class=''><a href='#' id='" + dataPathHash.path[0].name + "'>"; 
//	NodeNavBar += dataPathHash.path[0].name + "</a></li>";
//	generateNodeElementBar(dataPathHash.path[0].name);
	for (var i = 0; i < HashObject.path.length; i=i+2){
		NodeNavBar += "<li class=''><a href='#' id='" + dataPathHash.path[i].name + "'>"; 
		NodeNavBar += dataPathHash.path[i].name + "</a></li>";
	}
	NodeNavBar += "</ul>";
	$("#nodeNavBar").html(NodeNavBar);
	$(".nav-pills a").click(function(){
		$("#movieNavBarWrap").empty();
		$(".nav-pills li").removeClass("active");
		var classSelector = "#" + $(this).attr("id");
		$(classSelector).parent().addClass("active");
		generateNodeElementBar($(this).attr("id"));
		durationRecords = [];
		IDRecords = [];
	});
}






console.log("drag and drop test");

// $(".nodeElementBarContentWrap").draggable({
    	// helper: "clone" , 
    	// opcaity: 0.5, 
    	// revert: true, 
    	// scroll: false, 
    	// appendTo: "#videoEditor",
    	// drag: function(event, ui){
    		// ui.helper.css({
    			// "width":$(this).css("width"),
    			// "height": $(this).css("height")
    		// });
    		// //.addClass("ui-sortable-helper");
    	// }
    // });

$( "#node-element-list" ).sortable({
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
	connectWith: "#node-element-list",
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
		
		ui.item.removeClass("nodeElementBarContentWrap")
			   .addClass("movieNavElementWrap")
	}
});
$( "#movie-nav-bar, #node-element-list" ).disableSelection();








function enableCSSResponse(){
	$(".nav-pills a").click(function(){
		//$("#movieNavBarWrap").empty();
		$(".nav-pills li").removeClass("active");
		var classSelector = "#" + $(this).attr("id");
		$(classSelector).parent().addClass("active");
		generateNodeElementBar($(this).attr("id"));
		durationRecords = [];
		IDRecords = [];
	});
	$( "#slider-range-min" ).slider({
      range: "min",
      value: 500,
      min: 1,
      max: 700,
      slide: function( event, ui ) {
        $( "#amount" ).val( "$" + ui.value );
      }
    });
    $( "#amount" ).val( "$" + $( "#slider-range-min" ).slider( "value" ) );
    // $("#dragtest").on("dragstart", function(event){event.preventDefault();})
    			  // .on("mousedown", function(e){
			    	// var x = e.pageX, y = e.pageY, w=$(this).css("width");
			    	// var temp = '<div id="dragtesttemp" class="nodeElementBarContentWrap btn btn-default"><img class="nodeElementBarContent" name="spimg" src="../img/sample_img.jpg"></div>';
			    	// $("#videoEditor").append(temp);
			    	// $("#dragtesttemp").css("position", "absolute")
			    					  // .css("top", y/2)
			    					  // .css("left", x/2)
			    					  // .css("width", w)
			    					  // .draggable({ containment: "#videoEditor", scroll: false })
			    					  // .on("mouseup", function(){
			    					  	// $(this).remove();
			    					  // })
//     	
    // }); containment: "#videoEditor", scroll: false, revert: true, 
    // $("#dragtest").draggable({
    	// helper: "clone" , 
    	// opcaity: 0.5, 
    	// revert: true, 
    	// scroll: false, 
    	// appendTo: "#videoEditor",
    	// drag: function(event, ui){
    		// ui.helper.css({
    			// "width":$(this).css("width"),
    			// "height": $(this).css("height")
    		// });
    	// }
    // });

}
