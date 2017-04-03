define(['../js/eic-gui-master/client/scripts/eic/PresentationController2'], function(PresentationController2){
	$.getJSON("../data_json/jash_object_test_1.json", function(data){
			var jsonObject = data;
			var controller = new PresentationController2(jsonObject);
			//var view = new PiecesUI(controller);
				//view.drawScreen($("#screen"));
			console.log(jsonObject);
		});
})
