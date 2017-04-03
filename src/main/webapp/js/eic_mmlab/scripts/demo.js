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
 
 //Just loads up some scripts...just keep adding new scripts to the list when creating test pages
  require(['lib/jquery',
    'eic/WAVPlayer',
    'eic/SlidePresenter',
    'eic/TTSService',
    'eic/PresentationController',
    'eic/PresentationController2',
    'config/URLs'], 
	function ($, WAVPlayer, SlidePresenter, TTSService, PresentationController, PresentationController2, urls) {
    });
})(requirejs);