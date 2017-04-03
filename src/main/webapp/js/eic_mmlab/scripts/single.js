(function (requirejs) {
  "use strict";

  requirejs.config({
    shim: {
      'lib/jquery': {
        exports: 'jQuery'
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


  require(['eic/PresentationController', 'eic/PiecesUI', 'config/URLs','eic/Summarizer', 'eic/HashParser'], function (PresentationController, PiecesUI, urls,Summarizer, HashParser) {
		
		$(document).ready(function(){
			$('#frame').show();
			$("#play-button").attr("disabled", "disabled");
			
			var preloaded;
			
			$('#screenWrap').html("<div id='screen'> </div> <div id='subtitles'></div>");
			$('#screen').html('');
			$.ajax({
                type: "GET",
                url: urls.singlepath,
                dataType: "json",
                error: function (error) {
                  self.addGenerator(new ErrorSlideGenerator('No path between found.'));
                  self.loader.stopWaiting();
                },
                success: function (path) {
                	document.getElementById('subject').innerHTML = path.source.name;
                	document.getElementById('object').innerHTML = path.destination.name;
                	var relation = HashParser.prototype.generateLabelFromUri(path.path[1].uri);
                	var inverse = path.path[1].inverse;
                	var relationContent = Summarizer.prototype.generateRelationshipSentence(path.source.name, path.destination.name, relation, inverse);
                	
                	console.log(relationContent);
                	document.getElementById('relation').innerHTML = relationContent;
                	var controller = new PresentationController(path, {intro: false, outro: false, generatorOptions: {videoOptions: {maxVideoCount: 0}}});
					controller.playMovie();
                }
           });
		   //Second ajax call to preload the second movie
		   $.ajax({
                type: "GET",
                url: urls.singlepath,
                dataType: "json",
                error: function (error) {
                  self.addGenerator(new ErrorSlideGenerator('No path between found.'));
                  self.loader.stopWaiting();
                },
                success: function (path) {
                	preloaded = new PresentationController(path, {intro: false, outro: false, generatorOptions: {videoOptions: {maxVideoCount: 0}}});
					preloaded.createMovie();
                }
           });
			function detectChange() {
				var checkboxes = $('#singleCheckbox input[type="checkbox"]:checked');
				if (checkboxes.length > 0) {
					$("#play-button").removeAttr("disabled");
				}
				else {
					$("#play-button").attr("disabled", "disabled");
				}
			}
			
			$("#checkbox1").change(detectChange);
			$("#checkbox2").change(detectChange);
			$("#checkbox3").change(detectChange);
			$("#checkbox4").change(detectChange);
			$("#checkbox5").change(detectChange);
		
			function validate(subject,relation,object){
				console.log("clicked ");
				var info = {};
				var values= "";
				$("input:checkbox[name=checkbox]:checked").each(function(index, element) {
					console.log(element);
						values += element.value + ",";
				});
				info["key"] = values; console.log(values);
				info["triple"] = subject + "," + relation + "," + object;
				console.log(info["triple"]);
				document.getElementById("checkbox1").checked = false;
				document.getElementById("checkbox2").checked = false;
				document.getElementById("checkbox3").checked = false;
				document.getElementById("checkbox4").checked = false;
				document.getElementById("checkbox5").checked = false;
				$.ajax({
					url:"/LODStories/DemoPageServlet",
					type: "GET",
					data:info,
					dataType: "json",
					complete: function(xhr, textStatus) {
						console.log(xhr.responseText);
					},
					error: function(xhr, textStatus) {
						console.log(xhr.responseText);
					}
				});
			}

						
			$("#play-button").click(function(){
				//$('#screenWrap').html("<div id='screen' style ='height:465px; width: 758px'> </div> <div id='subtitles' style ='width: 758px'></div>");
				$("#play-button").attr("disabled", "disabled");
				$('#screen').html('');
				$('#subtitles').text('');
				
				
				document.getElementById('subject').innerHTML = preloaded.path.source.name;
				document.getElementById('object').innerHTML = preloaded.path.destination.name; 
				document.getElementById('relation').innerHTML = Summarizer.prototype.generateRelationshipSentence(preloaded.path.source.name, preloaded.path.destination.name, HashParser.prototype.generateLabelFromUri(preloaded.path.path[1].uri), preloaded.path.path[1].inverse);	                	
				validate(preloaded.path.source.name, HashParser.prototype.generateLabelFromUri(preloaded.path.path[1].uri) ,preloaded.path.destination.name);
				var controller = preloaded;
				controller.playMovie();				
				
	
				$.ajax({
					type: "GET",
					url: urls.singlepath,
					dataType: "json",
					success: function(path){
						if (!path.hash){
							alert("Internal server error");
							console.log(path);
						}
						else{
							preloaded = new PresentationController(path, {intro: false, outro: false, generatorOptions: {videoOptions: {maxVideoCount: 0}}});
							preloaded.createMovie();
						}
					},
					error: function(error){
						alert("error" + error.status);
						console.log(error);
					}
			   });    
			});
		});
    });
})(requirejs);
