/*!
 * EIC Summarizer
 * Copyright 2012, Multimedia Lab - Ghent University - iMinds
 * Licensed under GPL Version 3 license <http://www.gnu.org/licenses/gpl.html> .
 */
define(['lib/jquery', 'eic/Logger', 'config/URLs', 'eic/TTSService', 'eic/HashParser'], function ($, Logger, urls, TTSService, HashParser) {
  //"use strict";
  var logger = new Logger("Summarizer");

  /*
   * CLEANUP
   **/

  function Summarizer() {
    this.result = {
      topics : [],
      links : []
    };
  }

  Summarizer.prototype = {
    summarize : function (data) {

      logger.log('Started summarization');

      var path = data.path;
      var self = this;

      /**
       * Generate the result formatted as the 'test' .json
       */
      function formatResult(result, vertices) {			
        for (var i = 1; i < result.topics.length; i++) {
          var glue = "";
          if(result.links[i - 1].inverse == 1)
            glue = result.topics[i].topic.label + " " + result.links[i - 1].value + " " + result.topics[i - 1].topic.label + ". ";
          else
            glue = result.topics[i - 1].topic.label + " " + result.links[i - 1].value + " " + result.topics[i].topic.label + ". ";
          
          result.topics[i].topic.previous =  result.topics[i - 1].topic.label;
          result.topics[i].hash_object.defaultText = glue + result.topics[i].hash_object.defaultText;
          
          if (!result.topics[i].hash_object.audio_text)
			result.topics[i].hash_object.audio_text=result.topics[i].hash_object.defaultText;
		  //updating the hash object
		  //vertices[i].audio_text = result.topics[i].text;
        }
        
        //to handle the first node
		if (!result.topics[0].hash_object.audio_text)
		  result.topics[0].hash_object.audio_text=result.topics[0].hash_object.defaultText;
		//vertices[0].audio_text = result.topics[0].text;
		
        return {
          steps: result.topics
        };
      }

      function retrieveTranscriptions(edges) {

        function retrieveTranscription(index, edge) {
          //var  property = edge.uri.substr(edge.uri.lastIndexOf('/') + 1);
		  var property = edge.relationString;
          logger.log('Extracting sentence for', edge.relationString);

          self.result.links[index] = 
          {
			  inverse: edge.inverse,
			  value: property
		  };

          if ((self.result.topics.length + self.result.links.length) === path.length) {
            $(self).trigger('generated', formatResult(self.result));
          }
        }

        $(edges).each(retrieveTranscription);
      }

      function retrieveAbstracts(vertices) {	  
		  
        var uri = vertices.map(function (vertice) { return vertice.uri; });
        $.ajax({
          url: urls.abstracts,
          dataType: 'jsonp',
          data: {
            uri: uri.join(',')
          },
		  timeout: 30000,
          success: function (abstracts) {
            //if (!abstracts.length || abstracts.length === 0)
			//	logger.log('No abstracts found');

            function retrieveAbstract(index, vertice) {
              var uri = vertice.uri || '';
              var tregex = /\n|([^\r\n.!?]+([.!?]+|$))/gim;

              /*function getLabel(item) {
                if (item.label)
                  return item.label;
				
                var label = HashParser.prototype.generateLabelFromUri(uri);
				item.label = label;
				
				return label;
              }*/

              function getDescription(item) {
			    var maxSentences = 1;
                var abstract = item.abstract || '';
                var sentences = abstract.match(tregex) || [];
				var word;
				
				
				for (var i=0; i<sentences.length; i++){
					word = sentences[i].split(" ");
					if (word[word.length-1].length<3)
						  maxSentences += 1;
					else
						break;
				}
                var desc = sentences.slice(0, maxSentences).join(' ');
                return desc;
              }

              var item = abstracts[uri] || {},
                  desc = getDescription(item);
                  
              vertice.defaultText = desc;
              
              self.result.topics[index] = {
                topic : {
                  type: item.type || '',
                  label: vertice.name
                },
                hash_object: vertice
                //defaultText : desc,
                //text: vertice.audio_text,
                //slide_description: vertice.slide_description
              };

              if ((self.result.topics.length + self.result.links.length) === path.length) {
                $(self).trigger('generated', formatResult(self.result, vertices));
              }
			  logger.log('created', self.result.topics[index]);
              logger.log('Resource', vertice);
              logger.log('Extracted text', desc);
            }

            $(vertices).each(retrieveAbstract);
          },
          error: function (err) {
            logger.log('Error retrieving abstracts', err);
            
            //Try to just run even without any actual extracted descriptions?
            var abstracts = [];
            
            function retrieveAbstract(index, vertice) {
              var uri = vertice.uri || '';
              var tregex = /\n|([^\r\n.!]+([.!]+|$))/gim;

              function getLabel(item) {
                if (item.label)
                  return item.label;
				
                var label = HashParser.prototype.generateLabelFromUri(uri);
				item.label = label;
				
				return label;
              }

              function getDescription(item) {
			    var maxSentences = 1;
                var abstract = item.abstract || '';
                var sentences = abstract.match(tregex) || [];
				var word;
				
				
				for (var i=0; i<sentences.length; i++){
					word = sentences[i].split(" ");
					if (word[word.length-1].length<4)
						  maxSentences += 1;
					else
						break;
				}
                var desc = sentences.slice(0, maxSentences).join(' ');
                return desc;
              }

              var item = abstracts[uri] || {},
                  desc = getDescription(item);
                  
              vertice.defaultText = desc;
              
              self.result.topics[index] = {
                topic : {
                  type: item.type || '',
                  label: vertice.name
                },
                hash_object: vertice
                //defaultText : desc,
                //text: vertice.audio_text,
                //slide_description: vertice.slide_description
              };

              if ((self.result.topics.length + self.result.links.length) === path.length) {
                $(self).trigger('generated', formatResult(self.result, vertices));
              }
			  logger.log('created', self.result.topics[index]);
              logger.log('Resource', vertice);
              logger.log('Extracted text', desc);
            }

            $(vertices).each(retrieveAbstract);
          }
        });
      }

      retrieveTranscriptions(path.filter(function (o) { return o.type === 'link'; }));
      retrieveAbstracts(path.filter(function (o) { return o.type === 'node';  }));
    }
  };
  return Summarizer;
});



