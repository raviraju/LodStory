/*!
* EIC TTSService
* Copyright 2012, Multimedia Lab - Ghent University - iMinds
* Licensed under GPL Version 3 license <http://www.gnu.org/licenses/gpl.html> .
*/

define(['lib/jquery', 'eic/Logger', 'lib/jvent', 'config/URLs', 'lib/base64_handler'],
function ($, Logger, EventEmitter, urls) {
    "use strict";
    var logger = new Logger("TTSService");
    
    //IE is the only current browser without data: uri support, so check if it supports Blobs...otherwise we must wait for synthesis during the embedding phase...
    var urlType;
	if (navigator.userAgent.indexOf('MSIE') !=-1){
		if (window.URL){
			if (window.URL.createObjectURL)
				urlType=1; //Since comparing strings is hard, let's use integers: 1=objectURL 2=normalURL 3=data:uri
			else
				urlType=2;
		}
		else
			urlType=2;
	}
	else if (window.URL){ //Try to get the objectURL method...otherwise fall back to data:uri
		if (window.URL.createObjectURL)
			urlType=1;
		else
			urlType=3;
	}
	else
		urlType=3;


    function TTSService() {
      EventEmitter.call(this);
      this.finished = false;
      this.attempt = 0;
	  this.requests = [];
    }

    TTSService.prototype = {
		getSpeech: function (text, lang, callback) {
        var self = this;

        logger.log('Requesting audio URL ' + text);
        sendSpeech();
        
        function sendSpeech(){
		
			if (text.length==0){
				self.finished = true;
				logger.log('Empty request', text);
				self.emit('speechError', text);
				return;
			}
				
		
			//Try to resend the request every 10 seconds, up to 4 times, in case a request gets lost or garbled
			if (self.finished)
			return;

			self.attempt++;

			if (self.attempt>=3){
				logger.log('Error receiving speech (timed out)', text);
				self.emit('speechError', text);
				return;
			}
			
			/** TODO: Find a way to cancel repetitive requests once one works so that we don't waste bandwidth...use timeout and/or abort? **/
			setTimeout(function(){	
				if (!self.finished){
					self.attempt++;
					sendSpeech(self.attempt);
				}
			},15000);
			
			console.log("Attempt #"+self.attempt+" for "+text);
			$.ajax({
				beforeSend: function (xhr){
					self.requests[self.attempt] = xhr;
				},
				url: urls.festivalspeech,	
				type: 'GET',
				data: { req_text: text, url_type: urlType, id: self.attempt},
				dataType: 'jsonp',
				success: function (data) {
					
					if (self.finished)
						return;

					if (data.res === 'OK') {
						
						if (!data.text){
							if (self.attempt>=3){
								if (!self.finished){
									logger.log('Error receiving speech', data);
									self.emit('speechError', data);
								}
							}
							else{
								if (!self.finished){
									logger.log('Error with speech, new attempt: ' + self.attempt);
									sendSpeech();
								}
							}
							return;
						}
						
						self.finished = true;
						
						//Abort all other requests that may be processing in order to avoid wasting bandwidth by downloading the same thing multiple times
						var i;
						for (i=1; i<self.attempt; i++){
							if (i==data.id)
								continue;
							
							if (self.requests[i]){
								logger.log("ABORTING FOR " + text);
								try{
									self.requests[i].abort();
								}
								catch(e){
									logger.log("Tried to abort the finished request atttempt " + i + "?");
								}
							}
						}
					
						if (urlType==3) //data:uri method
							data.snd_url+=data.text;
						else if (urlType == 1){ //createObjectURL method...only available for new browsers
                            var blob = new Blob([base64DecToArr(data.text)], {type: "audio/mpeg"});
                            data.snd_url = window.URL.createObjectURL(blob);
                        }
                        else //Slow url method...just for IE 9 and under
                            data.snd_url+=window.escape(data.text);

						logger.log('Received audio URL', text + 'url:' + data.snd_url);

						if (callback)
							callback(data);

						self.emit('speechReady', data);
					}
					else {
						if (data.err_code == 404){
							if (!self.finished){
								logger.log('Blank speech request, aborted');
								self.emit('speechError',data);
							}
						}
						else if (self.attempt>=2){
							if (!self.finished){
								logger.log('Error receiving speech1', data);
								self.emit('speechError', data);
							}
						}
						else{
							if (!self.finished){
								logger.log('Error with speech, new attempt: ' + self.attempt);
								sendSpeech();
							}
						}
					}
				},
				error: function (error) {
					if (self.finished)
						return;
						
					if (self.attempt>=2){
						if (!self.finished){
							logger.log('Error receiving speech2', error);
							self.emit('speechError', error);
						}
					}
					else{
						logger.log('Error with speech2, new attempt: ' + self.attempt);
						sendSpeech();
					}
				}
			});
		}
      }
    };

    return TTSService;
});
