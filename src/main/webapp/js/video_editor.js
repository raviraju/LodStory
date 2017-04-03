/****************************************** DATA SOURCE PREPARATION *******************************************/
var dataPathHash = new Object;
var hashObjectArray = new Object;
var exetime;

function readJSONPath(){
	$.getJSON("../data_json/sample_path.json", function(data){
		dataPathHash = data;
		exetime = dataPathHash.excecution_time;
		console.log("dataPathHash", dataPathHash, "exetime", exetime);
	});
}

function generatePathArray(){
	hashObjectArray[dataPathHash.path[0].name] = [];
	hashObjectArray[dataPathHash.path[0].name][1] = Object;
	hashObjectArray[dataPathHash.path[0].name][1].name = "none";
	hashObjectArray[dataPathHash.path[0].name][1].slide_description = [];
	hashObjectArray[dataPathHash.path[0].name][0] = dataPathHash.path[0];
	for (var i = 2; i < dataPathHash.path.length; i = i + 2){
		hashObjectArray[dataPathHash.path[i].name] = [];
		hashObjectArray[dataPathHash.path[i].name][0] = dataPathHash.path[i];
		hashObjectArray[dataPathHash.path[i].name][1] = dataPathHash.path[i-1];
	}
	console.log("hashObjectArray", hashObjectArray);
}

/****************************************** PAGE CONTENT PREPARATION *******************************************/
function generateNodeNavBar(){
	var NodeNavBar = "<ul class='nav nav-pills nav-justified'>";
	NodeNavBar += "<li class='active'><a href='#' id='" + dataPathHash.path[0].name + "'>"; 
	NodeNavBar += dataPathHash.path[0].name + "</a></li>";
	generateNodeElementBar(dataPathHash.path[0].name);
	for (var i = 2; i < dataPathHash.path.length; i=i+2){
		NodeNavBar += "<li><a href='#' id='" + dataPathHash.path[i].name + "'>"; 
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

function generateNodeElementBar(nodeName){
	$("#nodeElementBar").empty();
	$("#textDescription").html(hashObjectArray[nodeName][0].audio_text);
	console.log(hashObjectArray[nodeName]);
	for (var i = 0; i < hashObjectArray[nodeName][0].slide_description.length; i++){
		generateNodeElement(nodeName, hashObjectArray[nodeName][0].slide_description[i], i, hashObjectArray[nodeName][0].slide_description[i].duration);
	}
	enableElementBarContentOperation();
	$(".nodeElementBarContent").click(function(){
		$("#moviePreview").html("<img class='imgPreview' src='" + $(this).attr("src") + "'>");
	});
}

function generateNodeElement(nodename, node, index, duration){
	console.log(node, "uri", node.data.uri);
	var element = "<div id='" + node.data.uri + "' class='nodeElementBarContentWrap btn btn-default'>";
		element += "<img class='nodeElementBarContent' name='"
		element += nodename + index + node.type
		element += "' duration='" + duration + "' src='" + node.data.uri + "'/>"
		element += "</div>";
	$("#nodeElementBar").append(element);
}


/********************************************* UI OPERATION **************************************************/
var elementURI, elementID, elementDuration, elementSelector, elementlength, newNavElement, mainWidth, mainHeight, movieNavBarWidth, thresholdHeight, tempIndicator, tempWidth, tempHeight, tempTopini, tempLeftini, durationRecords = [], IDRecords = [];
var append, moveindicator;
durationRecords[0] = 0;
mainWidth = $("#videoEditor").css("width").replace(/[^-\d\.]/g, '');
mainHeight = $("#videoEditor").css("height").replace(/[^-\d\.]/g, '');
movieNavBarWidth = $("#movieNavBarWrap").css("width").replace(/[^-\d\.]/g, '');
thresholdHeight = mainHeight * 0.83;


function enableElementBarContentOperation(){
	$(".nodeElementBarContent").on("dragstart", function(event){event.preventDefault();});
	$(".nodeElementBarContent").on("mousedown", function(e){
		$("#moviePreview").html("<img class='imgPreview' src='" + $(this).attr("src") + "'>");
		var original = $(this);
		append = 0;
		moveindicator = 0;
		elementURI = $(this).attr("src");
		elementID = $(this).attr("name");
		elementDuration = $(this).attr("duration");
		elementSelector = "#" + elementID;
		tempWidth = $(this).css("width");
		tempHeight = $(this).css("height");
		tempTopini = e.pageY - tempHeight.replace(/[^-\d\.]/g, '') / 2 + "px";
		tempLeftini = e.pageX - tempWidth.replace(/[^-\d\.]/g, '') / 2 + "px";
		$(this).css("opacity", 0.5);
		console.log(tempTopini, tempLeftini, elementURI, tempWidth, tempHeight);	
		var newElement = '<img class="mainScreenTemp" duration="' + elementDuration + '" src="' + elementURI + '">';
		if ($(".mainScreenTemp").length == 0){
			$("#videoEditor").append(newElement);
		}
		$(".mainScreenTemp").css("width", tempWidth)
							.css("height", tempHeight)
							.css("top", tempTopini)
							.css("left", tempLeftini)
							.on("dragstart", function(event){
								event.preventDefault();
								prepareNavBarElement($(this), $(this).attr("duration"))
							})
							.on("mousemove", function(e){
								tempTopini = e.pageY - tempHeight.replace(/[^-\d\.]/g, '') / 2 + "px";
								tempLeftini = e.pageX - tempWidth.replace(/[^-\d\.]/g, '') / 2 + "px";
								$(this).css("top", tempTopini)
									   .css("left", tempLeftini);
								appendToMovieNav(e, $(this), $(this).attr("duration"));
							})
							.on("mouseup", function(){
								if (moveindicator == 1){
									original.parent().remove();
									original.remove();
									$(elementSelector + "").css("opacity", 1);
									enableNavOperation($(elementSelector + ""));
								}
								else {
									durationRecords.pop();
									IDRecords.pop();
									console.log("durationRecords", durationRecords);
									console.log("IDRecords", IDRecords);
								}
								$(this).remove();
								$(".nodeElementBarContent").css("opacity", 1);
							});
	});
}
function prepareNavBarElement(temp, duration){
	elementlength = duration / exetime * movieNavBarWidth;
	if (durationRecords.length == 0){
		if (movieNavBarWidth < elementlength){
			elementlength = movieNavBarWidth;
		}
		durationRecords.push(elementlength);
		console.log("durationRecords", durationRecords);
	}
	else {
		if (movieNavBarWidth - durationRecords[durationRecords.length - 1] < elementlength){
			elementlength = movieNavBarWidth - durationRecords[durationRecords.length - 1]-20;//should be 13
			console.log("The duration of this element has been shortened due to the limit of space");
		}
		durationRecords.push(durationRecords[durationRecords.length - 1] + elementlength);
		console.log("durationRecords", durationRecords);
		//console.log("IDRecords", IDRecords);
	}
	newNavElement = '<div id="' + elementID + '" style="width: ' + elementlength + 'px;"  class="movieNavElementWrap btn btn-default Enable"><img class="movieNavElement" id="' + elementID + 'thumbnail" src="';
	newNavElement += elementURI + '"><div id="remove' + elementID + '" target1="' + elementURI + '" target2="'; 
	newNavElement += elementID + '" class="movieNavOperation">Remove</div></div>';
	IDRecords.push(elementID);
	console.log("IDRecords", IDRecords);
}

function appendToMovieNav(e, temp, duration){
	
	if (e.pageY > thresholdHeight){
		moveindicator = 1;
		temp.css("opacity", 0.5);
		if (append == 0) {
			//$("#movieNavBarWrap").append(newNavElement);
			if (IDRecords.length == 1){
				$("#movieNavBarWrap").append(newNavElement);
				append = 1;
			}
			else {
				console.log("insert");
				var widthComp = mainWidth * 0.01;
				if (e.pageX < durationRecords[0]+widthComp+30){
					var tempSelector = "#"+IDRecords[0];
					$(tempSelector + "").before(newNavElement);
 					append = 1;
 					// var tempID = IDRecords[IDRecords.length-1];
 					// for (var i = durationRecords.length-2; i>0; i--){
 						// durationRecords[i] = durationRecords[i-1] + elementLength;
 					// } 
 					// for (var i = IDRecords.length-1; i>0; i--){
 						// IDRecords[i] = IDRecords[i-1];
 					// }
 					// IDRecords[0] = tempID;
				}
				else {
	 				for (var i = 1; i < durationRecords.length; i++){
	 					if (e.pageX > durationRecords[i]+widthComp-30 && e.pageX < durationRecords[i]+widthComp+30){
	 						var tempSelector = "#"+IDRecords[i-1];
	 						$(tempSelector + "").after(newNavElement);
	 						append = 1;
	 						// for (var j = i+1; j<durationRecords.length-2; j++){
	 							// durationRecords[j] += durationRecords[j] + elementLength;
	 						// }
	 						// IDRecords[IDRecords.length] = IDRecords[IDRecords.length-1];
	 						// for (var k = IDRecords.length-1; k>i-1; k--){
	 							// IDRecords[k] = IDRecords[k-1];
	 						// }
	 					}
	 				}
	 				
 				}
			}
			$(".movieNavElementWrap").click(function(){
				var thumbnailSelector = "#" + $(this).attr("id");
					thumbnailSelector += "thumbnail";
				$("#moviePreview").html("<img class='imgPreview' src='" + $(thumbnailSelector + "").attr("src") + "'>");	
			});
			$("#remove" + elementID).click(function(){
				var elementBack = '<div class="nodeElementBarContentWrap btn btn-default"><img class="nodeElementBarContent" name="' + $(this).attr("target2") + '" src="' + $(this).attr("target1") + '"></div>';
				$("#nodeElementBar").append(elementBack);
				enableElementBarContentOperation();
				$(this).parent().remove();
				
			});
			$(elementSelector + "").css("opacity", 0.5);
			//append = 1;
		}
	}
	else {
		moveindicator = 0;
		temp.css("opacity", 1);
		if (append == 1){
			$(elementSelector + "").remove();
			append = 0;
		}	
	}
}

function enableNavOperation(element){
	console.log("here");
	console.log(element);
}


//****************************************Function Calls***********************************//
$(window).load(function(){
	readJSONPath();
})
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
	generatePathArray();
	generateNodeNavBar();
});