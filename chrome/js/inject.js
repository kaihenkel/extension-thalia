/**
 * 
 */
var s = document.createElement('script');
s.src = chrome.extension.getURL('js/screencontroler.js');
var v = document.getElementsByTagName("head")[0];

if (v) {
	v.insertBefore(s, v.firstChild);
} else {
	(document.head||document.documentElement).appendChild(s);
}

document.addEventListener("thalia:setToken", function(data) {
//	alert('received event: ' + data);
    chrome.runtime.sendMessage("thalia:setToken");
});




(function() {
	console.trace('inject: autoexecute test');
}());