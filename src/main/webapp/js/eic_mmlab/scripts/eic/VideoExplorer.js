/*
* LODStories Video Explorer
* Copyright 2014, LOD Story Team - University of Southern California - Information Sciences Institute
* Licensed under 
*/


define(['lib/jquery', 'eic/Logger', 'lib/d3','eic/PresentationController','eic/PiecesUI', 'eic/SlideEditor', 'eic/HashParser', 'eic/Summarizer', 'config/URLs'],
function ($, Logger, d3,PresentationController, PiecesUI, SlideEditor, HashParser, Summarizer, urls) {  
	"use strict";
	var logger = new Logger("PathFinder");

	//Constructor
	function VideoExplorer(options) {
		this.options = options || {};
		this.index = 0;
		this.init();
	}

	//Member functions
	VideoExplorer.prototype = {
		init: function(){
			var self = this;
			var startLabel='';
			var url_ref;
			$.getJSON('../data_json/uri_matching.json', function(data) {
				url_ref = data;
			});

			$('#search').keyup(function() {
				var searchField = $('#search').val();
				if (searchField != "")
					$('#liveSearch').show();
				else
					$('#liveSearch').hide();
					
				var myExp = new RegExp(searchField, "i");
				var output = '<ul class="dropdown-menu" id="searchUpdate" role="menu" aria-labelledby="dropdownMenu1">';
				$.each(url_ref, function(key, val) {
					var label = HashParser.prototype.generateLabelFromUri(val.uri);
					if ((label.search(myExp) != -1)) {
						output += '<li role="presentation"><a class="searchItem" role="menuitem" tabindex="-1" href="#">';
						output += label;
						output += '</li>';
					}
				});
				output += '</ul>';
				$('#liveSearch').html(output);
				$(".searchItem").click(function(){
					startLabel = $(this).html();
					$('#search').val(startLabel);
					$('#liveSearch').hide();
					$('#liveSearch').empty();
				});
			});
			$(".videoSearch").click(function(){
				if (startLabel=='')
					return;
					
				$.ajax({
					url: urls.hashFilter,
					type: 'POST',
					data: {startNode: HashParser.prototype.escapeString(startLabel), startIndex: self.index},
					success: function (data) {
						console.log(data);
						$("#searchWindow").css("display", "none");
						$(".listWrap").show();			
						for (var i=0; i<data.hashObjects.length; i++){
							var row = document.createElement('tr'); 
							row.videoID = data.hashObjects[i].hashID;
							$(row).append("<td class='videoThumbnail'><img src='"+data.hashObjects[i].thumbnail+"' class='videoThumbnailImage'></td>"+
									"<td class='videoInfo'><div><h3>"+HashParser.prototype.unescapeString(data.hashObjects[i].title)+"</h3>"+
									"<div>by "+HashParser.prototype.unescapeString(data.hashObjects[i].author)+"</div>"+
									"<div>Path: "+HashParser.prototype.unescapeString(data.hashObjects[i].path)+"</div>"+
									"<ul class='ratingInfo'>"+
									"<li>Likes: "+data.hashObjects[i].likes+"</li>"+
									"<li>Dislikes: "+data.hashObjects[i].dislikes+"</li></ul></div></td>");
							$('#videoList').append(row);
						}
						self.index +=data.hashObjects.length;
						
						$("tr").click(function(){
							var selectedVid = $(this)[0].videoID;
							console.log(selectedVid);
							
							$.ajax({
								url: urls.hashRetrieve,
								type: 'GET',
								dataType: 'json',
								data: {hashID: selectedVid},
								success: function (data) {
									if (!data.hash){
										alert("Error loading video");
									}
									else{
										var path = JSON.parse(HashParser.prototype.unescapeString(data.hash));
										path.hashID = selectedVid;
										
										location.hash= selectedVid;
										
										//Attach functions to the replay and edit buttons now that the specific video is known					
										$(self.options.outroOptions.outroButtons[1]).click(function () {
											window.location = window.location.pathname.slice(0,window.location.pathname.slice(1).indexOf('/')+1)+"/html/lodstories_demo.html#"+selectedVid;
										})
										
										$(self.options.outroOptions.outroButtons[2]).click(function () {
											$('#screen').html('');
											$('#subtitles').text('');
											$('#screenWrap').show();
											var play = new PresentationController(path, self.options);
											play.playMovie();
										})				
										
										$(".listWrap").hide();
										$('#screen').html('');
										$('#subtitles').text('');
										$('#screenWrap').show();

										var controller = new PresentationController(path, self.options);
										controller.playMovie();
									}
								},
								error: function(error){
									console.log(error);
									alert("Error loading video");
								}
							});
						});
					},
					error: function(error){
						if (self.index==0)
							$("#messageBox").html("No videos for "+startLabel+" found. Why don't you <a href='/LODStories/html/lodstories_demo.html'>create one</a>?");
						else
							$("#messageBox").html("No more videos for "+startLabel+" found.");
							
						$("#secondarySearch").hide();
					}
				});
			});
		}
	};
   
   return VideoExplorer;
});