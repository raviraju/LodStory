define(['eic/Logger'], function ($) {
	//Dummy class whose sole purpose is to escape and unescape hash objects for mysql-appropriate strings...doesn't need to be instantiated to work
	//Also threw the uri->label function here for lack of anywhere else to put it
	function HashParser() {
	}
	
	HashParser.prototype = {
		escapeString: function(str){
			//str = encodeURI(str);
			str = str.replace(/\\/g,"\\\\");
			str = str.replace(/\0/g, "\\0");
			str = str.replace(/\n/g, "\\n");
			str = str.replace(/\r/g, "\\r");
			str = str.replace(/'/g, "\\'");
			str = str.replace(/"/g, '\\"');
			str = str.replace(/\x1a/g, "\\Z");
			
			return str;
		},
		unescapeString: function(str){
            str = str.replace(/\\\\/g,"\\");
            str = str.replace(/\\0/g, "\0");
            str = str.replace(/\\n/g, "\n");
            str = str.replace(/\\r/g, "\r");
            str = str.replace(/\\'/g, "'");
            str = str.replace(/\\"/g, '"');
            str = str.replace(/\\Z/g, "\x1a");
			//str = decodeURI(str);

            return str;
        },
		generateLabelFromUri: function(uri){
			var label = uri.substr(uri.lastIndexOf('/') + 1);
			label = decodeURIComponent(label);
			label = label.replace(/_/g,' ');
			
			return label;
		}
	};
	return HashParser;
});