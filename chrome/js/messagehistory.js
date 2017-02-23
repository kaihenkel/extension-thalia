/**
 * Stores message histories and displays them 
 * */

var history = history || {
	add : function(msg, type) {
		
	}
	
	, get : function(type, fn) {
		if (typeof fn === 'undefined' && typeof type === 'function') {
			fn = type;
			type = undefined;
		}
		
		chrome.storage.local.get('history', function(result) {
			if (result) {
				var history;
				if (typeof type !== 'undefined') {
					history = result[type];
				} else {
					history = result;
				}
				
				fn(history);
			}
		});
	}
	
	, add : function (message, type) {
		this.get(type, function(history) {
			history = history || [];
			history.push(message);
			
			
		});
	}
};

(function() {
	console.log('init history');
//	chrom	e.runtime.onMessage.addListener(history.onMessage);
	
	
	chrome.storage.local.get("history", function(result) {
		console.log('received stored history: ' +result.history);
	});
})();