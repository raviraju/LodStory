/*
 * LODStory Slide Editor
 * Copyright 2014, LOD Story Team - University of Southern California - Information Sciences Institute
 * Licensed under
 */

define(['lib/jquery', 'eic/Logger', 'lib/jvent', 'config/URLs', 'eic/AudioEditor',
        'eic/generators/IntroductionSlideGenerator', 'eic/generators/OutroductionSlideGenerator', 'eic/generators/CompositeSlideGenerator', 'eic/generators/ErrorSlideGenerator',
        'eic/TopicSelector', 'eic/generators/CustomSlideGenerator', 'eic/SlidePresenter', 'eic/PresentationController', 'eic/HashParser', 'lib/jquery__ui'],
    function ($, Logger, EventEmitter, urls, AudioEditor, IntroductionSlideGenerator, OutroductionSlideGenerator, CompositeSlideGenerator, ErrorSlideGenerator, TopicSelector, CustomSlideGenerator, SlidePresenter, PresentationController, HashParser, jquery__ui) {
        "use strict";
        var logger = new Logger("SlideEditor");

        function SlideEditor(generator, path, controller, hashObj) {
            EventEmitter.call(this);
       
            this.controller = controller;
            this.curTopic = null;
            this.tempSlides = {};
            this.topics = controller.topicToTopic.generators;

            this.hash_object = path;

            //EDITING NODES//

            this._path = hashObj.path;
            this._Slide_Element_Collection = new Object();
            //this._Play_Sequence = [];
            //this._curNode = this._path[0];
            this._curIndex = 1;
            this._hash = hashObj;
       
            var self = this;

            this.players = [];
            this.audio_editor = new AudioEditor();


            logger.log("Created slideEditor");

            $('#movie-nav-bar').on('drop', function (ev) {
                self.drop(ev, self._curIndex, self.topics, 0);
            });
            $('#movie-nav-bar').on('dragover', function (ev) {
                self.allowDrop(ev);
            });

            $('#imgs').on('drop', function (ev) {
                self.drop(ev, self._curIndex, self.topics, 1);
            });
            $('#imgs').on('dragover', function (ev) {
                self.allowDrop(ev);
            });

            $('#vids').on('drop', function (ev) {
                self.drop(ev, self._curIndex, self.topics, 1);
            });
            $('#vids').on('dragover', function (ev) {
                self.allowDrop(ev);
            });

            self.startEdit();
        }

        /* Member functions */

        SlideEditor.prototype = {
            // Starts the movie about the connection between the user and the topic.
            startEdit: function () {
                $('#videoEditor').css('display', 'block');

                // Create the slides panel
                var $slides = $('<div>').addClass('slides2'),
                    $wrapper = $('<div>').addClass('slides2-wrapper')
                        .append($slides);

                this.$slides = $slides;

                // Hide the main panel and show the slides panel
                $('#moviePreview').append($slides);// wrapperr
                $wrapper.hide().fadeIn($.proxy($slides.hide(), 'fadeIn', 1000));

                var self = this;

                for (var i = 1; i < self.topics.length; i++) {
                    self.topics[i].prepare();
                }

                var firstInit = false;
                for (var i = 1; i < self.topics.length; i++) {
                    var $button = $('<button>').attr("class", "btn btn-sm btn-info nodeNavBtn")
                        .attr("id", self.topics[i].topic.label)
                        .attr("order", i)
                        .html(self.topics[i].topic.label);
                    $button.click(function () {
                        $("#movie-nav-bar").html('');
                        self._curIndex = $(this).attr("order");
                        self.switchTopic(this.id, self._curIndex);
                    });
                    $('#nodeNavBar').append($button);
                    if (!firstInit && self.topics[i] !== undefined) {
                        self.curTopic = self.topics[i];
                        var slide = self.topics[i].next();
                        firstInit = true;
                        self.$slides.append(slide.$element);
                    }
                }

                self.switchTopic(self.topics[1].topic.label, 1);
                $('#img-element-list-wrap').css('display', 'inline');
                $('#vid-element-list-wrap').css('display', 'none');

                setTimeout(function () {
                    self.initElementCollection();
                    self.EnableUIAnimation();

                }, 10);
            },
            
            switchTopic: function (id, curIndex) {
                this.audio_editor.setTopic(this.topics[curIndex]);		//Switch the active node in the AudioEditor

                if (this.topics[curIndex].slide_order !== undefined) {
                    var editedSlides = new Array;
                    for (var i = 0; i < this.topics[curIndex].slide_order.length; i++) {
                        editedSlides.push(this._Slide_Element_Collection[this.topics[curIndex].slide_order[i]]);
                    }
                }

                for (var i = 1; i < this.topics.length; i++) {
                    if (this.topics[i] !== undefined && this.topics[i].topic.label == id) {

                        this.curTopic = this.topics[i];

                        var slide = this.topics[i].next();
                        // start the transition of other children
                        var children = this.$slides.children();
                        children.remove();
                        this.$slides.append(slide.$element);

                        var self = this;

                        //add appropriate slides to edit box
                        var slides = self.topics[i].getSlides();

                        var imgcnt = 0;
                        var vidcnt = 0;

                        $("#img-load").css('display', 'none');
                        $("#vid-load").css('display', 'none');
       
                        for(var j = 0; j < this._hash.path.length; j++) {

                        	if(this._hash.path[j].uri == this.curTopic.hash_object.uri){
	                        	var nodeType = this.curTopic.hash_object.type;
	                        	
	                        	if(nodeType == "node"){
	                            	console.log('**************');
                            	
	                        		var curTopic = this._hash.path[j].name;
	                        		console.log("current topic : " + curTopic);
	                        		var obj = this;
	                        		var src_url = "https://api.gettyimages.com/v3/search/images/creative?phrase=" + curTopic	                            
	                            	var apiKey = 'jsvk4vgcve562yg9m4uvmx39';
		                            $.ajax({
		                                    type:'GET',
		                                    url:src_url,
		                                    beforeSend: function (request)
		                                        {
		                                            request.setRequestHeader("Api-Key", apiKey);
		                                        }
		                                  })
		                                .done(function(data){	                                	
		                                    //console.log(data);
		                                    //console.log(self._hash);
		                                    var max_images = 3;
		                                    var gettyImages = [];
		                                    for(var i = 0;i<data.images.length;i++)
		                                    {
		                                    	var url = data.images[i].display_sizes[0].uri;
		                                    	gettyImages.push(url);
		                                    	//console.log(url);	 
		                                    	if (i>max_images){
		                                    		break;
		                                    	}
		                                    }
		                                    console.log(gettyImages);

		                                    if (gettyImages.length == 0) {
		                                    	console.log("handle no images");
		                                    	$('#imgs').append('<li><i>No images found</i></li>');
		                                    }
		                                    for(var k = 0; k < gettyImages.length; k++){
	                                            var url = gettyImages[k];
	                                            //check if url is already present
	                                            
	                                            var urlFound = false;
	                                            var existingImages = slides['img'];
	                                            for (var z = 0; z < existingImages.length; z++){
	                                            	var existingUrl = existingImages[z].slide_info.data.url;
	                                            	if (url == existingUrl){
	                                            		console.log('image already present' +  url);
	                                            		urlFound = true;
	                                            		break;
	                                            	}
	                                            }
	                                            if (urlFound){
	                                            	break;
	                                            }
	                                            
	                                            
	                                            var newslide = {};
	                                            newslide["slide_info"] = {};
	                                            //var newslide = $.extend(jQuery.Event, slides['img'][0]);
	                                            newslide.slide_info["type"] = "GoogleImageSlide";
	                                            newslide.slide_info["data"] = {};
	                                            newslide.slide_info.data["url"] = url;
	                                            console.log(newslide);
	                                            slides['img'].push(newslide);
	                                            console.log(slides);
		                                    }
		                                    
		                                    for (var val in slides) {
		                                        if (val == 'img' || val == 'map') {
		                                            imgcnt++;
		                                            var s = slides['img'];
		                                            obj.tempSlides['img'] = s;
		                                            $('#imgs').children().remove();
		                   
		                                            for (var i = 0; i < s.length; i++) {
		                                                var isEdited = false;
		                                                var imgs = s[i].slide_info.data.url; //get just the image link
		                                                if (editedSlides !== undefined && editedSlides.length > 0) {
		                                                    for (var j = 0; j < editedSlides.length; j++) {
		                                                        if (editedSlides[j].type == "GoogleImageSlide" && editedSlides[j].data.url == imgs) {
		                                                            isEdited = true;
		                                                            break;
		                                                        }
		                                                    }
		                                                }
		                                                if (!isEdited) {
		                                                    $('#imgs').append('<li id=img' + i + '></li>');
		                                                    $('#img' + i + '').addClass('nodeElementBarContentWrap');
		                                                    $('#img' + i + '').attr('draggable', 'true').on('dragstart', function (ev) {
		                                                        self.drag(ev);
		                                                    });
		                                                    $('#img' + i + '').append('<img id=imgs' + i + ' src=' + imgs + '>');
		                                                    $('#imgs' + i).click(function () {
		                                                        var id = "imgs" + i;
		                                                        self.setContent(id, i, 'img');
		                                                    });
		                                                }
		                                            }
		                                        }
		                                    }
		                                    
		                                    if (imgcnt == 0) {
		                                        $("#img-none").css('display', 'inline');
		                                        $('img-none').addClass('alert alert-danger');
		                                        $("img-none").text('No images found');
		                                    }
		                                    else $("#img-none").css('display', 'none');
		                                    
		                                    
		                                    
		                                    if (editedSlides !== undefined && editedSlides.length > 0) {
		                                        for (var i = 0; i < editedSlides.length; i++) {
		                                            $('#movie-nav-bar').append('<li id=hurr' + i + '></li>');
		                                            $('#hurr' + i + '').addClass('ui-state-default btn btn-default movieNavElementWrap');
		                                            $('#hurr' + i + '').css('display', 'block');
		                                            if (editedSlides[i].type == "YouTubeSlide") {
		                                                $('#hurr' + i + '').append('<img src=http://img.youtube.com/vi/' + editedSlides[i].data.videoID +
		                                                    "/default.jpg id=hurrs+" + i + ">");
		                                            }
		                                            else {
		                                                $('#hurr' + i + '').append('<img src=' + editedSlides[i].data.url + " id=hurrs+" + i + ">");
		                                            }
		                                        }
		                                    }
		                                    
		                                    
		                                    
		                                    
		                                    
		                                    
		                                    
		                                    
		                                    
		                                    
		                                    
		                                    
		                                    
		                                    
		                                    
		                                    
			                        	})
		                                .fail(function(data){
		                                	console.log(data,2);
		                                });
	                        		
	                        		}
                        	}
                        	
                        	
                        	
                        	
                        	
                        	//Existing Code
                            /*if(this._hash.path[j].uri == this.curTopic.hash_object.uri && this._hash.path[j].image != undefined){
                                var imgs = this._hash.path[j].image.split(",");
                                console.log(imgs);
                                for(var k = 0; k < imgs.length; k++){
                                    var url = imgs[k];
                                    var newslide = {};
                                    newslide["slide_info"] = {};
                                    //var newslide = $.extend(jQuery.Event, slides['img'][0]);
                                    newslide.slide_info["type"] = "GoogleImageSlide";
                                    newslide.slide_info["data"] = {};
                                    newslide.slide_info.data["url"] = url;
                                    console.log(newslide);
                                    slides['img'].push(newslide);
                                    console.log(slides);
                                }
                            }*/
                        }
                        //Moved within Ajax Request
                        /*for (var val in slides) {
                            if (val == 'img' || val == 'map') {
                                imgcnt++;
                                var s = slides['img'];
                                this.tempSlides['img'] = s;
                                $('#imgs').children().remove();
       
                                for (var i = 0; i < s.length; i++) {
                                    var isEdited = false;
                                    var imgs = s[i].slide_info.data.url; //get just the image link
                                    if (editedSlides !== undefined && editedSlides.length > 0) {
                                        for (var j = 0; j < editedSlides.length; j++) {
                                            if (editedSlides[j].type == "GoogleImageSlide" && editedSlides[j].data.url == imgs) {
                                                isEdited = true;
                                                break;
                                            }
                                        }
                                    }
                                    if (!isEdited) {
                                        $('#imgs').append('<li id=img' + i + '></li>');
                                        $('#img' + i + '').addClass('nodeElementBarContentWrap');
                                        $('#img' + i + '').attr('draggable', 'true').on('dragstart', function (ev) {
                                            self.drag(ev);
                                        });
                                        $('#img' + i + '').append('<img id=imgs' + i + ' src=' + imgs + '>');
                                        $('#imgs' + i).click(function () {
                                            var id = "imgs" + i;
                                            self.setContent(id, i, 'img');
                                        });
                                    }
                                }
                            }
                        }*/
                       //Moved within Ajax Request
                        /*if (imgcnt == 0) {
                            $("#img-none").css('display', 'inline');
                            $('img-none').addClass('alert alert-danger');
                            $("img-none").text('No images found');
                        }
                        else $("#img-none").css('display', 'none');*/

                        /*if (vidcnt == 0) {
                            $("#vid-none").css('display', 'inline');
                            $('#vid-none').addClass('alert alert-danger');
                            $('#vid-none').text('No videos found');
                        }
                        else $("#vid-none").css('display', 'none');*/
                        //Moved within Ajax Request
                        /*if (editedSlides !== undefined && editedSlides.length > 0) {
                            for (var i = 0; i < editedSlides.length; i++) {
                                $('#movie-nav-bar').append('<li id=hurr' + i + '></li>');
                                $('#hurr' + i + '').addClass('ui-state-default btn btn-default movieNavElementWrap');
                                $('#hurr' + i + '').css('display', 'block');
                                if (editedSlides[i].type == "YouTubeSlide") {
                                    $('#hurr' + i + '').append('<img src=http://img.youtube.com/vi/' + editedSlides[i].data.videoID +
                                        "/default.jpg id=hurrs+" + i + ">");
                                }
                                else {
                                    $('#hurr' + i + '').append('<img src=' + editedSlides[i].data.url + " id=hurrs+" + i + ">");
                                }
                            }
                        }*/
                        break;
                    }
                }
            },

            setContent: function (id, index, type) {
                var arr = this.tempSlides[type];

                /*TODO: BETTER WAY TO DO THIS!!!!*/
                if (id == 'imgs0' || id == 'vids0') this.curTopic.setCurSlide(arr[0]);
                else if (id == 'imgs1' || id == 'vids1') this.curTopic.setCurSlide(arr[1]);
                else if (id == 'imgs2' || id == 'vids2') this.curTopic.setCurSlide(arr[2]);
                else if (id == 'imgs3' || id == 'vids3') this.curTopic.setCurSlide(arr[3]);
                else if (id == 'imgs4' || id == 'vids4') this.curTopic.setCurSlide(arr[4]);
                else if (id == 'imgs5' || id == 'vids5') this.curTopic.setCurSlide(arr[5]);
                else if (id == 'imgs6' || id == 'vids6') this.curTopic.setCurSlide(arr[6]);
                else if (id == 'imgs7' || id == 'vids7') this.curTopic.setCurSlide(arr[7]);
                else this.curTopic.setCurSlide(arr[index]);

                this.$slides.children('.transition-out').remove();
                // start the transition of other children
                var children = this.$slides.children();
                children.remove();
                var newSlide;
                if (type == 'vid') {
                    newSlide = this.curTopic.next().slide_info.data.videoID;
                    this.$slides.append('<img src=http://img.youtube.com/vi/' + newSlide + "/default.jpg class='imgPreview'>")
                } else {
                    newSlide = this.curTopic.next().$element.clone().find('img');
                    newSlide.addClass('imgPreview');
                    this.$slides.append(newSlide[0]);
                }
            },

            getSlides: function () {
                return this.$slides;
            },

            playSlide: function () {
                var currentSlide = this.curTopic.next();
                currentSlide.start();
                var self = this;
                setTimeout(function () {
                    self.curTopic.next().stop();
                }, currentSlide.duration);
            },

            pauseSlide: function () {
                this.curTopic.next().stop();
            },
            initElementCollection: function () {
                var self = this;
                for (var i = 1; i < this.topics.length; i++) {
                    this.topics[i].slide_order = [];
                    var slides = this.topics[i].slides;
       
                    var img = slides.img;
                    var vid = slides.vid;
                    for (var j = 0; j < img.length; j++) {
                        this._Slide_Element_Collection[img[j].slide_info.data.url] = img[j].slide_info;
                    }
                    for (var k = 0; k < vid.length; k++) {
                        this._Slide_Element_Collection[vid[k].slide_info.data.videoID] = vid[k].slide_info;
                    }
       
                    for(var j = 0; j < this._hash.path.length; j++) {
                        /*if(this._hash.path[j].uri == this.topics[i].hash_object.uri && this._hash.path[j].image != undefined){
                            var imgs = this._hash.path[j].image.split(",");
                            for(var k = 0; k < imgs.length; k++){
                                var url = imgs[k];
                                var slide_info = {};
                                slide_info["type"] = "GoogleImageSlide";
                                slide_info["data"] = {};
                                slide_info.data["url"] = url;
                                this._Slide_Element_Collection[url] = slide_info;
                            }
                        }*/
                    	if(this._hash.path[j].uri == this.topics[i].hash_object.uri){
                    		var nodeType = this.topics[i].hash_object.type;
                    		if(nodeType == "node"){
                            	console.log('**************');                        	
                        		var curTopic = this._hash.path[j].name;
                        		console.log("current topic : " + curTopic);
                        		var obj = this;
                        		var src_url = "https://api.gettyimages.com/v3/search/images/creative?phrase=" + curTopic	                            
                            	var apiKey = 'jsvk4vgcve562yg9m4uvmx39';
	                            $.ajax({
	                                    type:'GET',
	                                    url:src_url,
	                                    beforeSend: function (request)
	                                        {
	                                            request.setRequestHeader("Api-Key", apiKey);
	                                        }
	                                  })
	                            .done(function(data){	                                	
		                                    //console.log(data);
		                                    //console.log(self._hash);
		                                    var max_images = 3;
		                                    var gettyImages = [];
		                                    for(var i = 0;i<data.images.length;i++)
		                                    {
		                                    	var url = data.images[i].display_sizes[0].uri;
		                                    	gettyImages.push(url);
		                                    	//console.log(url);	 
		                                    	if (i>max_images){
		                                    		break;
		                                    	}
		                                    }
		                                    console.log(gettyImages);
		                                    
		                                    for(var k = 0; k < gettyImages.length; k++){
	                                            var url = gettyImages[k];
	                                            var slide_info = {};
	                                            slide_info["type"] = "GoogleImageSlide";
	                                            slide_info["data"] = {};
	                                            slide_info.data["url"] = url;
	                                            obj._Slide_Element_Collection[url] = slide_info;	                                          
	                                            console.log(obj._Slide_Element_Collection);	                                            
		                                    }
	                            })
                                .fail(function(data){
                                	console.log(data,2);
                                });
                    		}
                    	}
                    }
                }
            },

            EnableUIAnimation: function () {
                var self = this;

                $('#lastStep').click(function () {
                    location.hash = '';
                    $("#stepNavigator").css("display", "none");
                });

                $('#play-button').click(function () {

                    //Hide the editor so that it's not possible to click the play button multiple times...
                    $('#editor').css('display', 'none');

                    //Give a second for the last node's edits to process before checking the hash
                    setTimeout(function () {
                        self.evaluateHash(true);
                    }, 1000);

                    if (self.evaluated) {
                        logger.log("Evaluated hash", self._hash);
                        $('#editor').hide();
                        $('#screen').html('');
                        $('#subtitles').text('');
                        $('#screenWrap').show();
                        var play = new PresentationController(self._hash, {intro: false, outro: true, generatorOptions: {videoOptions: {maxVideoCount: 0}}, outroOptions: self.controller.outroOptions});
                        console.log("PresentationController: ", play, play.path.path);
                        play.playMovie();
                    }
                    else {
                        self.once('hash evaluated', function () {
                            logger.log("Evaluated hash", self._hash);
                            $('#screen').html('');
                            $('#subtitles').text('');
                            $('#screenWrap').show();
                            var play = new PresentationController(self._hash, {intro: false, outro: true, generatorOptions: {videoOptions: {maxVideoCount: 0}}, outroOptions: self.controller.outroOptions});
                            console.log("PresentationController: ", play, play.path.path);
                            play.playMovie();
                        });
                    }
                });

                $('#play-slide').click(function () {
                    if ($('#play-slide').html() == 'Play Slide') {
                        $('#play-slide').html('Pause Slide');
                        self.playSlide();
                    }
                    else {
                        $('#play-slide').html('Play Slide');
                        self.pauseSlide();
                    }
                });

                $("#mask").css({
                    'z-index': 5,
                    position: 'fixed',
                    display: 'none',
                    'opacity': 0.7,
                    'background-color': '#ccc',
                    height: '100%',
                    width: '100%',
                    top: '0px',
                    left: '0px',

                });

                var dialog = $("#dialog-form").dialog({
                    dialogClass: "no-close",
                    autoOpen: false,
                    height: 300,
                    width: 200,
                    modal: true,
                    position: {
                        my: "center",
                        at: "center",
                        of: "body"
                    },
                    buttons: {
                        "Save Hash Object": function () {
                            $("#mask").hide();
                            dialog.dialog("close");
                            self.saveHash();
                        },
                        Cancel: function () {
                            $("#mask").hide();
                            dialog.dialog("close");
                        }
                    }
                });

                $("#dialog-form").show();		//Now that we've attached the form to a dialog box....it can be "shown"

                $('#save-button').click(function () {
                    //Save the newest edits
                    self.evaluateHash(false);

                    //Give a second for the last node's edits to process before saving the hash
                    setTimeout(function () {
                        $("#mask").show();
                        dialog.dialog("open");
                    }, 1000);
                });
            },

            allowDrop: function (ev) {
                ev.preventDefault();
            },

            drag: function (ev) {
                ev.dataTransfer = ev.originalEvent.dataTransfer.setData("text/html", ev.target.id);
            },

            drop: function (ev, curIndex, topics, which) {
                ev.preventDefault();
                var data;
                if (which == 0) {
                    data = ev.originalEvent.dataTransfer.getData("text/html");
                    data = data.substring(data.indexOf(">") + 1);
                    document.getElementById("movie-nav-bar").appendChild(document.getElementById(data));
                    $('#' + data + '').removeClass("nodeElementBarContentWrap");
                    $('#' + data + '').addClass("movieNavElementWrap");
                    $('#' + data + '').attr("draggable", "true");
                    $('#movie-nav-bar').css("padding", "3px");
                } else if (which == 1) {
                    var id;
                    if(ev.originalEvent.dataTransfer.mozSourceNode) {
                        data = ev.originalEvent.dataTransfer.mozSourceNode;
                        id = data.id;
                    }
                    else
                    {
                        data = ev.srcElement;
                        id = "imgs" + data.id.match(/\d+/)[0];
                    }
                    $('#' + id).removeClass("movieNavElementWrap").addClass("nodeElementBarContentWrap");
                    $('#' + id).removeAttr("draggable");
                    if (id.search("imgs") != -1) {
                        document.getElementById("img" + id.match(/\d+/)[0]).appendChild(document.getElementById(id));
                    } else {
                        document.getElementById("vids" + id.match(/\d+/)[0]).appendChild(document.getElementById(id));
                    }
                }

                var movieNav = $("#movie-nav-bar .movieNavElementWrap");
                var navlist = new Array(movieNav.length);
                for (var i = 0; i < movieNav.length; i++) {
                    navlist[i] = movieNav[i].src;
                }

                if (movieNav[0] == undefined) {
                    $("#movie-nav-bar").css("padding", "50px");
                }

                for (var i = 0; i < navlist.length; i++) {
                    if (navlist[i].indexOf("youtube") != -1) {
                        var vidID = navlist[i].substring(26, 37);
                        navlist[i] = vidID;
                    }
                }
       
                topics[curIndex].slide_order = navlist;
            },

            //Used at the end to run through the hash object and update the durations of chosen image/vid slides, as well as saving players for selected videos
            //Create a pseudo-slide_description for default vids so that we don't waste time trying to load new ones
            evaluateHash: function (finalize) {
                logger.log("evaluating hash");
                var i, j;
                var topics = this.topics;
                console.log(topics);
                //update the hash object with the chosen slides
                for (var k = 1; k < topics.length; k++) {
                    var editedSlides = new Array();
                    for (var l = 0; l < this.topics[k].slide_order.length; l++) {
                        editedSlides.push(this._Slide_Element_Collection[this.topics[k].slide_order[l]]);
                    }
                    this._path[2 * (k - 1)].slide_description = editedSlides;
                }

                //This part of the function populates the hash with pseudo-descriptions for the defaults, as well as normalizing duration settings
                if (finalize) {
                    for (i = 1; i < topics.length; i++) {
                    	console.log(topics[i].hash_object);
                        if (!topics[i].hash_object.slide_description) {
                            topics[i].updateHash();
                        }
       
                        //Only do proper time updates if the slide_description was real
                        else if (!topics[i].hash_object.temp) {
                            var parts = 0;
                                for (j = 0; j < topics[i].hash_object.slide_description.length; j++) {
                                    if (topics[i].hash_object.slide_description[j] && topics[i].hash_object.slide_description[j].type == "YouTubeSlide")
                                        parts += 3
                                else
                                    parts += 1;
                            }
                            console.log(topics[i].hash_object.slide_description);
                            for (j = 0; j < topics[i].hash_object.slide_description.length; j++) {
                                    if (topics[i].hash_object.slide_description[j] && topics[i].hash_object.slide_description[j].type == "YouTubeSlide") {
                                        topics[i].hash_object.slide_description[j].data.duration = Math.floor((topics[i].hash_object.audio_time * 3) / parts);
                                        if (topics[i].hash_object.slide_description[j].player)
                                            this.players.push(topics[i].hash_object.slide_description[j].player.playerId);
                                    }
                                else{
                                	if(topics[i].hash_object.slide_description[j])
                                		topics[i].hash_object.slide_description[j].data.duration = Math.floor(topics[i].hash_object.audio_time / parts);
                                }
                            }
                        }
                    }
                }
                //Make sure NOT to start cleaning the ytholder or starting the presentation controller until the entire hash has been looped through
                this.evaluated = true;
                logger.log("finished evaluation");
                this.emit('hash evaluated');
            },
            //Keep all youtube players, since we'll need them again if we implement replay function
            /*cleanYTHolder: function(){
             var i;

             //add a class to the players we wanna save
             for (i=0; i<this.players.length; i++){
             $('#container_'+this.players[i]).addClass('save');
             }

             //Now remove the extraneous players
             $('#ytholder').children().not('.save').remove();
             }*/
            saveHash: function (hashID) {
                var hash = JSON.parse(JSON.stringify(this.hash_object));
                var path = "";
                var self = this;
                var title = $("#title").val();
                var author = $("#author").val();
                var imgCollection = [];
                var thumbnail;

                if (!title)
                    title = "Untitled";
                if (!author)
                    author = "Anonymous";
				
				//Save the author as a list of previous authors
				if (this.hash_object.author){
					author = this.hash_object.author + ";" + author;
				}
				
                title = HashParser.prototype.escapeString(title);
                author = HashParser.prototype.escapeString(author);

                //Nodes are found every 2 steps in the path (other half of the steps are links)

                for (var i = 0; i < hash.path.length; i += 2) {
                	if(hash.path[i].type == "node"){
	                    var node = hash.path[i].name;
	                    path += node + "; ";
	                    console.log("path : " + path);
                	}

                    //Dereference the audio info since the URL's most likely is a binary blob and we'll get the time again anyway
                    delete hash.path[i].audioURL;
                    delete hash.path[i].audio_time;
                    //Dereference temporary slide descriptions
                    if (hash.path[i].temp) {
                        delete hash.path[i].slide_description;
                        delete hash.path[i].temp;
                    }
                    //else save the description if it has one, but unreference all youtube player-related objects and populate the image array
                    else if (hash.path[i].slide_description && hash.path[i].slide_description.length > 0) {
                        for (var j = 0; j < hash.path[i].slide_description.length; j++) {
                            if (hash.path[i].slide_description[j].type == "YouTubeSlide") {
                                imgCollection.push("http://img.youtube.com/vi/" + hash.path[i].slide_description[j].data.videoID + "/default.jpg");
                                delete hash.path[i].slide_description[j].player;
                                delete hash.path[i].temp;
                            }
                            else {
                                imgCollection.push(hash.path[i].slide_description[j].data.url);
                            }
                        }
                    }
                }
                //If there were no real slide descriptions, then grab some images the same way the editor does?
                if (imgCollection.length < 1) {
                    for (var i = 1; i < self.topics.length; i++) {
                        var slides = self.topics[i].getSlides();
                        var s;
                        for (var val in slides) {
                            if (val == 'img' || val == 'map') {
                                s = slides['img'];
                                for (var j = 0; j < s.length; j++)
                                    imgCollection.push(s[j].slide_info.data.url);
                            }
                            if (val == 'vid') {
                                s = slides['vid'];
                                for (var j = 0; j < s.length; j++)
                                    imgCollection.push('http://img.youtube.com/vi/' + s[j].slide_info.data.videoID + '/default.jpg');
                            }
                        }
                    }
                }
                //Randomly choose a url from the image array to act as the thumbnail
                thumbnail = imgCollection[Math.floor(Math.random() * imgCollection.length)];
                path = HashParser.prototype.escapeString(path.trim());
                path = path.substr(0, path.length - 1);

                $.ajax({
                    url: urls.hashStore,
                    type: 'POST',
                    data: {hashID: hashID, hash: HashParser.prototype.escapeString(JSON.stringify(hash)), author: author, title: title, path: path, thumbnail: thumbnail},
                    success: function (data) {
                        location.hash = data.trim();
                        self.hash_object.hashID = data.trim();
                        alert("Your movie can be accessed at http://lodstories.isi.edu/LODStories/html/lodstories_videos.html#" + data.trim());
                    },
                    error: function (error) {
                        alert("Could not save movie");
                    }
                });
            }

        };

        return SlideEditor;
    });
