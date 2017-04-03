(function (requirejs) {
    "use strict";

    requirejs.config({
        shim: {
            'lib/jquery': {
                exports: 'jQuery'
            },
            'lib/jqyerUI': {
                deps: ['lib/jquery__ui']
            },
            'lib/jquery.ui.core': {
                deps: ['lib/jquery']
            },
            'lib/jquery.ui.widget': {
                deps: ['lib/jquery.ui.core']
            },
            'lib/jquery.ui.position': {
                deps: ['lib/jquery.ui.core']
            },
            'lib/jquery.ui.autocomplete': {
                deps: ['lib/jquery.ui.core', 'lib/jquery.ui.widget', 'lib/jquery.ui.position']
            },
            'lib/jquery__ui': {
                deps: ['lib/jquery']
            },
            'lib/jvent': {
                exports: 'jvent'
            },
            'lib/jplayer.min': {
                deps: ['lib/jquery']
            },
            'lib/prefixfree.jquery': {
                deps: ['lib/prefixfree.min']
            },
            'eic/pluginsniff':{
                exports: 'pluginsniff'
            },
            'lib/base64_handler':{
                exports: 'base64_handler'
            },
        },
    });

    require(['eic/PresentationController','eic/PiecesUI','eic/VideoExplorer','eic/HashParser','config/URLs'], function(PresentationController, PiecesUI, VideoExplorer, HashParser, urls){

        var hashId = location.hash.slice(1);
		
		var exitButtons = [];
	
		var button = $('<span>')
				.addClass('button')
				.click(function () {
				  window.location = window.location.pathname.slice(0,window.location.pathname.slice(1).indexOf('/')+1)+"/html/lodstories_demo.html";
				})
		   .text('Create new Movie');
		exitButtons.push(button);
		
		button = $('<span>')
				.addClass('button')
				.text('Edit this movie!');
		exitButtons.push(button);
		
		button = $('<span>')
				.addClass('button')
				.text('Replay');
		exitButtons.push(button);
		
		var options = {
			intro: false,
			outro: true,
			generatorOptions: {
				videoOptions: {
					maxVideoCount: 1
				}
			},
			outroOptions:{
				outroButtons: exitButtons
			}
		};

        $.ajax({
            url: urls.hashRetrieve,
            type: 'GET',
			dataType: 'json',
            data: {hashID: hashId},
            success: function (data) {
				//If there's no hash field, then the query failed. Go to search mode
				if (!data.hash){
					location.hash = "";
					$("#searchWindow").css("display", "inline");
					
					var video_explorer = new VideoExplorer();
				}
				else{//Else, load up the video
					var path = JSON.parse(HashParser.prototype.unescapeString(data.hash));
					path.hashID = hashId;
					
					//Attach functions to the replay and edit buttons now that the specific video is known					
					$(exitButtons[1]).click(function () {
						window.location = window.location.pathname.slice(0,window.location.pathname.slice(1).indexOf('/')+1)+"/html/lodstories_demo.html#"+hashId;
					})
					
					$(exitButtons[2]).click(function () {
						$('.navigation').detach();
						$('#screen').html('');
						$('#subtitles').text('');
						$('#screenWrap').show();
						var play = new PresentationController(path, options);
						play.playMovie();
					})					
					
					//Actually get around to playing the movie now
					$('#screen').html('');
					$('#subtitles').text('');
					$('#screenWrap').show();

					var controller = new PresentationController(path, options);
					controller.playMovie();
				}
            },
            error: function(error){
                location.hash = "";
                $("#searchWindow").css("display", "inline");
				var video_explorer = new VideoExplorer(options);
            }
        });



    });

})(requirejs);