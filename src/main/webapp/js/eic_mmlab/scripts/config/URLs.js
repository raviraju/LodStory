define(function () {
  "use strict";
  // var dirName = "/LODStories-1.0.0-SNAPSHOT";
  var dirName = window.location.pathname.slice(0,window.location.pathname.slice(1).indexOf('/')+1);
  return {
	hashFilter: dirName + "/filterHash?",
	hashRetrieve: dirName + "/retrieveHash?",
	ranking: dirName + "/rankServlet?jsoncallback=?",
	livedemo: dirName + "/liveDemo",	
	abstracts: dirName + "/descriptions?jsoncallback=?",
    festivalspeech: "http://lodstories.isi.edu/festival_service-1.0-SNAPSHOT/rest/audiotest/jsonfull/?jsoncallback=?",
    hashStore:  dirName + "/saveHash?",
    
    
    singlepath: dirName + "/rest/path/single/?jsoncallback=?",
	
	hashRate: dirName + "/rateHash?",
    jplayerSWF: "/scripts/swf",
    
	
	//main html pages
	main: dirName+"/html/linkeddataeduapp.html",
	demo: dirName+"/html/lodstories_demo.html",
	videos: dirName+"/html/lodstories_videos.html",
	single: dirName+"/html/SingleRelationshpDemo.html"
  };
});
