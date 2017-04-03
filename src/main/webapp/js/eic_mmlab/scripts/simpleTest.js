(function (requirejs) {
  "use strict";

  requirejs.config({
    shim: {
      'lib/jquery': {
        exports: 'jQuery'
      },
      'lib/d3': {
      	exports: 'd3'
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

  require(['eic/PresentationController', 'eic/PresentationController2','eic/PiecesUI', 'eic/SlideEditor'], function (PresentationController, PresentationController2, PiecesUI, SlideEditor) {
  
	var path = {
		"source": {
			"name": "Hillary Rodham Clinton",
			"uri": "http://dbpedia.org/resource/Hillary_Rodham_Clinton"
		},
		"destination": {
			"name": "Fort Bragg",
			"uri": "http://dbpedia.org/resource/Fort_Bragg"
		},
		"path": [
			{
				"type": "node",
				"name": "Hillary Rodham Clinton",
				"uri": "http://dbpedia.org/resource/Hillary_Rodham_Clinton"
			},
			{
				"type": "link",
				"inverse": false,
				"uri": "http://dbpedia.org/ontology/deputy"
			},
			{
				"type": "node",
				"name": "William Joseph Burns",
				"uri": "http://dbpedia.org/resource/William_Joseph_Burns"
			},
			{
				"type": "link",
				"inverse": false,
				"uri": "http://dbpedia.org/ontology/birthPlace"
			},
			{
				"type": "node",
				"name": "Fort Bragg",
				"uri": "http://dbpedia.org/resource/Fort_Bragg"
			}
		]
	};
	$("#editor").css("display", "inline");
	$("#body").css("display", "block");
	
	var exitButtons = [];
	
	var button = $('<span>')
			.addClass('button')
			.click(function () {
			  window.location = window.location.pathname.slice(0,window.location.pathname.slice(1).indexOf('/')+1)+"/html/lodstories_demo.html";
			})
	   .text('Start over');
    exitButtons.push(button);
   
    button = $('<span>')
    .addClass('button')
    .click(function () {
     //window.location.reload();
     $('#screenWrap').hide();
     $('#editor').show();
    })
    .text('Back to editor');
	exitButtons.push(button);
	
	button = $('<span>')
    .addClass('button')
    .click(function () {
		$('#play-button').click();
    })
    .text('Replay');
	exitButtons.push(button);
	
	var options = {
		generatorOptions: {
			videoOptions: {
				maxVideoCount: 2
			}
		},
		outroOptions:{
			outroButtons: exitButtons
		}
	};
	
    var controller = new PresentationController2(path, options);
    var view = new PiecesUI(controller);
    view.initControls();
    
    controller.once('slide_generation_finished', function(){
		var editor = new SlideEditor(controller.generator, controller.path, controller, path);
	});

  });
})(requirejs);

