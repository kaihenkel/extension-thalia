/**
 * This javascript file is injected into the thalia device shop 
 * to emulate the screencontroler script provided by the tolino eReaders 
 * 
 * It communicates with the thalia crome extension to handle oauth requests 
 * normally handled by the tholino firmware
 */
var screenController = {

	hideNavigationHeader : function() {
		log("screenController.hideNavigationHeader() called");
	},
	showNavigationHeader : function() {
		log("screenController.showNavigationHeader() called");
	},
	refreshScreen : function() {
		log("screenController.refreshScreen() called");
	},
	showProgressDialog : function() {
		log("screenController.showProgressDialog() called");
	},
	hideProgressDialog : function() {
		log("screenController.hideProgressDialog() called");
	},
	setTokens : function(accessToken, refreshToken) {
		log("screenController.setTokens('" + accessToken + "','" + refreshToken + "') called");
	},
	
	test: function() {
	    var event = document.createEvent('Event');
	    event.initEvent('thalia:setToken');
	    document.dispatchEvent(event);
	}
};


function log(msg) {
	if (window.console) {
		console.log('screenControler: ' + msg);
	}
}


(function() {
	console.log('screencontroler: autoexecute');
	screenController.test();
}());