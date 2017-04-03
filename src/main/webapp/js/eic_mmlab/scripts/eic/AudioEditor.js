define(['lib/jquery','eic/Logger','eic/SlidePresenter','lib/pluginsniff'],
function($,Logger,SlidePresenter){
	var logger = new Logger("AudioEditor");
	var plugintype;
    
    if (Audio){
        if (document.createElement('audio').canPlayType("audio/mpeg"))
            plugintype="Audio";
        else
            plugintype=Plugin.getPluginsForMimeType("audio/mpeg");
    }
    else{
        plugintype=Plugin.getPluginsForMimeType("audio/mpeg");
    }
	
	function AudioEditor(){
		this.curTopic;
		this.previousText;		//Used to avoid excessive speech resends	
	}
	
	AudioEditor.prototype={
		setTopic: function(topic)
		{
			if (this.curTopic)
				this.curTopic.removeAllListeners('newSpeech');
			
			this.curTopic = topic;
			$('#textDescription').val(topic.hash_object.audio_text);
			this.setUpAudio(this.curTopic);
			
			var self = this;		
			
			$('#textDescription').blur(function() {
				if (self.previousText==$('#textDescription').val()){
					return;
				}
				
				$('#playButtonGroup').html("loading");
				
				self.curTopic.resendSpeech($('#textDescription').val());
			});
			
			$('#textDescription').focus(function(){
				self.previousText=$('#textDescription').val();
			});
				
			$('#editTestDescription').click(function() {	
				if (self.curTopic.hash_object.audio_text == self.curTopic.hash_object.defaultText){
					return;
				}
				
				self.curTopic.resendSpeech(self.curTopic.hash_object.defaultText);
				$('#textDescription').val(self.curTopic.hash_object.defaultText);
			});
		},
		
		setUpAudio: function(slide){
			//REPLACE ALL THE HTML_OBJECTS
			if (slide.ready){
				this.addAudio();
			}
			var self = this;
			slide.on('newSpeech', function(){
				self.addAudio();
			});
		},
		
		addAudio: function(){
			if (!this.curTopic || this.curTopic.audioURL=='')
				return;
			
			if (plugintype=="Audio"){
				 $('#playButtonGroup').html(
					"<audio id='audioPlayer' src='"+this.curTopic.audioURL+"' controls='true'/>");
			}
			else if (plugintype=="QuickTime"){
				 $('#playButtonGroup').html(
					"<embed id='audioPlayer' src='" + this.curTopic.audioURL + "' controller='true' enablejavascript='true' autoplay='false' loop='false'>");
			}
			else if (plugintype=="Windows Media"){
				 $('#playButtonGroup').html(
					"<embed id='audioPlayer' src='" + this.curTopic.audioURL + "' width='200' height='100' Enabled='true' AutoStart='false' ShowControls='true'>");
			}
			else if (plugintype=="VLC"){
				 $('#playButtonGroup').html(
					"<embed id='audioPlayer' target='" + this.curTopic.audioURL + "' width='200' height='100' autoplay='false' controls='true'>");
			}	
		}
	};

	return AudioEditor;

});
