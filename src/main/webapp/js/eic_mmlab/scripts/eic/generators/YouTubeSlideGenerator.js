/*!
* EIC YouTubeSlideGenerator
*
* This class generates slides that contain YouTube videos
*
* Copyright 2012, Multimedia Lab - Ghent University - iMinds
* Licensed under GPL Version 3 license <http://www.gnu.org/licenses/gpl.html> .
*/
define(['lib/jquery', 'eic/generators/BaseSlideGenerator', 'eic/Logger'],
function ($, BaseSlideGenerator, Logger) {
  "use strict";
  
  /*
* CLEANUP
**/
  var logger = new Logger("YouTubeSlideGenerator");
  var playerCount = 0;
    
  var scriptFlag = false;
  
  //Try to grab the api once, and only once
  $.getScript("https://www.youtube.com/player_api", function () {
	scriptFlag=true;
  });

  /** Generator of YouTube videos using the YouTube API
* The option parameter is a hash consisting of
* - the maximum number of videos to return
* - the maximum duration (in milliseconds) of a video
* - the skipping duration (in milliseconds) at the beginning of the video
*/
  function YouTubeSlideGenerator(topic, options) {
    BaseSlideGenerator.call(this);
	
    this.topic = topic;
    options = options || {};
	this.preload = options.preload || true;
    this.maxVideoCount = options.maxVideoCount === undefined ? 1 : options.maxVideoCount;
    this.maxVideoDuration = options.maxVideoDuration || 5000;
    this.skipVideoDuration = options.skipVideoDuration || 10000;
    this.orderMethod = options.orderMethod || 'relevance';
    this.totalDuration = 0;
    this.slides = [];
	this.slidesCopy = [];
	this.ready = false;
	this.player = [];
  }

  $.extend(YouTubeSlideGenerator.prototype,
           BaseSlideGenerator.prototype,
  {
    /** Checks whether any slides are left. */
    hasNext: function () {
      return this.slides.length > 0;
    },

    /** Fetches a list of images about the topic. */
    init: function () {
      if (this.inited)		
        return;
     
		if (this.maxVideoCount==0){		//Why waste time finding videos if we have none?
			this.ready = true;
			this.emit("prepared");
			this.inited = true;
			return;
		}
	 
      var self = this;	
	  
	  if (!scriptFlag){
		$.getScript("https://www.youtube.com/player_api", function () {
			searchVideos(self, 0, self.maxVideoCount, 0);
		});
	  }
	  else{
		searchVideos(self, 0, self.maxVideoCount, 0);
	  }
      
      this.inited = true;
    },

    /** Advances to the next slide. */
    next: function () {
      return this.slides.shift();
    },
	
	reset: function() {
		for (var i=0; i< this.slidesCopy.length; i++){
			this.slides[i] = this.slidesCopy[i];		//Is this okay?
		}
	},
    
	prepare: function(){
		var i;
		for (i=0; i<this.player.length; i++){
			this.prepareVid(i);
		}
	},
	
	/** Prepare video by playing and pausing it, in order to prebuffer its contents. */
    prepareVid: function (index) {
		var self = this, player = self.player[index];
		var waiting=true;
	
		//avoid preloading the video twice
		if (player.status && player.status != "unstarted"){
			//logger.log("vid has already started preparing");
			setTimeout(function(){
				waiting=false;
			}, 10000)
			checkIfBuffered();
			return;
		}	
	
		if (player && player.playVideo){
			preload()
			//Only allow for up to 10 seconds of stalling on the preload
			setTimeout(function(){
				waiting=false;
			}, 10000)
			checkIfBuffered();
		}
		else{
			self.once("playerReady"+index, function(){
				preload();
				//Only allow for up to 10 seconds of stalling on the preload
				setTimeout(function(){
					waiting=false;
				}, 10000)
				checkIfBuffered();
			});
		}
      
	  
		function preload(){	
			//If we don't care about preloading then just log it as done
			if (!preload){
				self.ready = true;
				logger.log("finished waiting on youtube for " + self.topic.label);
				self.emit("prepared");
				return;
			}
		
			// if we did not start preparations yet, and the player object is ready
			if (player && player.playVideo) {
				//Putting this status check within, b/c we don't actually wanna call preload() again (it'd lead to an endless recursive call) if the status was something other than "unstarted"
				if (player.status == "unstarted"){
					player.status = "preparing";	
					player.playVideo();
				}
			}
			else{
				setTimeout(function(){preload()},1000);
			}
		}
	  
		function checkIfBuffered(){		
			if (waiting && player.getVideoLoadedFraction() < player.end/player.getDuration()){
				window.setTimeout(function(){checkIfBuffered()}, 1000);
			}
			else{
				player.status = "loaded";
				
				//Only emit if ALL players are loaded/timed out. Not the most efficient way to do things but usually only 1-2 players per generator
				var i;
				for (i=0; i<self.player.length; i++){
					if (player.status!="loaded")
						break;
					
					if (i==self.player.length-1){
						self.ready = true;
						logger.log("finished waiting on youtube for " + self.topic.label);
						self.emit("prepared");
					}
				}
			}
		}
	  
    },

    /** Adds a new video slide. */
    addVideoSlide: function (videoID, duration, slide_info) {
	//console.log(this);

		var self = this, start, duration;
		
		// create a placeholder on the slide where the player will come
		var $placeholder = $('<div>'),
			slide = this.createBaseSlide('youtube', $placeholder, duration);
		
		if (slide_info){
			slide.slide_info = slide_info;
			start = slide_info.data.start;
		}
		else{
			start = self.skipVideoDuration;	
			slide.slide_info = {
				type: "YouTubeSlide",
				data: {
					videoID: videoID,
					start: start,
					duration: duration,  
				},
			};
		}				
		
		
		if (!scriptFlag){
			$.getScript("https://www.youtube.com/player_api", function () {
				addSlide();
			});
		}
		else{
			addSlide();
		}
		
		function addSlide(){	
			//Just a random error handler to prevent stalling on videos
			if (!duration)
				duration = 5000;

			self.totalDuration += duration;
						
			var player=null, temp, playerId, $container;
			
			/** TODO What happens if someone's already played the video using "play slide" (unimplemented). Will we rewind? Or reload from the editor? **/
			if (slide_info && slide_info.player){
				//logger.log ("Player object found. Reusing it");
				player = slide_info.player;
				playerId = slide_info.player.playerId;
				$container = $('#container_'+playerId);
				temp = self.player.push(player)-1;
				self.player[temp] = player;
								
				self.prepareVid(temp);
				
			}
			else{
				// create a container that will hide the player
				playerId = 'ytplayer' + (++playerCount),
				$container = $('<div>');
				$container.prop('id', 'container_'+playerId);
				$container.append($('<div>').prop('id', playerId))
										 .css({ width: 0, height: 0, overflow: 'hidden' });
				$('#ytholder').append($container);
				

				// create the player in the container			
				temp = self.player.push(player)-1;
				self.player[temp] = player = new window.YT.Player(playerId, {
					playerVars: {
						autoplay: 0,
						controls: 0,
						start: (start / 1000),
						//end: (end / 1000),	//End time is variable
						wmode: 'opaque'
					},
					videoId: videoID,
					width: $("#screen").width(),
					height: $("#screen").height(),
					events: { 
						onReady: function (event) { 
							event.target.mute(); 
							player.end = (start + duration)/1000;
							player.playerId = playerId;
							player.status = "unstarted";
							slide.slide_info.player = player;
							self.emit("playerReady"+temp);
						},
						onError: function(event){
							event.target.mute();
							self.ready = true;
							self.totalDuration = 0;
							logger.log("Error loading video for topic", self.topic.label);
							self.emit("prepared");					
						},
						onStateChange: function (event) {
							// as soon as the video plays, pause it (give it 0.2 seconds to actually register the fact that it had started playing?)...
							if (player.status == "preparing" || player.status == "loaded" && player.getPlayerState() == window.YT.PlayerState.PLAYING){
								setTimeout(function(){
									if (player.status == "preparing" || player.status == "loaded"){
										player.pauseVideo();
									}
								}, 200);
							}
						}
					}
				});
				
				self.prepareVid(temp);				
			}

			// if the slide starts, move the player to the slide
			slide.once('started', function () {
				// flag our state to make sure prepare doesn't pause the video
				player.status = 'started';

				// make video visible
				var offset = $placeholder.offset();

				//Avoid playVideo errors by making sure the player is ready...
				if (player && player.playVideo){
					player.playVideo();
				}
				else{
					self.once('playerReady', function(){
						if (player.status == "started" && player.playVideo)
							player.playVideo();
					});
				}
					
				$container.css({
					// move to the location of the placeholder
					position: 'absolute',
					top: offset.top,
					left: offset.left,
					// and make the container show its contents
					width: 'auto',
					height: 'auto',
					overflow: 'auto'
				});
			});
			slide.once('stopped', function () {
				player.status = "stopped";
				logger.log ("stopped");
				$container.fadeOut(function () {
					if (player && player.seekTo){
						player.pauseVideo();
						player.seekTo(start/1000, true);
						player.status = "unstarted";
						self.prepareVid(temp);
					}
					
					$container.removeAttr("style");
					$container.css({ width: 0, height: 0, overflow: 'hidden' });
				});
			});

			
			self.slides.push(slide);
			self.slidesCopy.push(slide);
			self.emit('newSlides');
		}	
    },
  });
  
  function searchVideos(self, startResults, maxResult, skip) {	  	  
    if (maxResult > 50) { //YouTube API restriction
      maxResult = 50;
    }
    var inspected = 0;
    var resultCounter = startResults;
    $.ajax({
		url: 'https://gdata.youtube.com/feeds/api/videos?v=2&max-results=' + maxResult + '&orderby=' + self.orderMethod + '&alt=jsonc&q=' + self.topic.label + "&format=5",
		success: function (response) {
			var items, itemCount;
			if (response.data.items)
				items = response.data.items;
			else
				items = 0;
			
			
			if (items !=0)
				itemCount = Math.min(items.length, self.maxVideoCount);
			else
				itemCount = 0;
			
			if (itemCount == 0){
				self.ready = true;
				logger.log("no youtube videos for " + self.topic.label);
				self.emit("prepared");
			}
			
			for (var i = 0; i < itemCount; i++)
				self.addVideoSlide(items[i].id, self.maxVideoDuration);
		},
		error: function(error){
			self.ready = true;
			logger.log("could not search youtube videos for " + self.topic.label);
			self.emit("prepared");
		}
	});
  }

  return YouTubeSlideGenerator;
});
