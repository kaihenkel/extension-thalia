/**
 * Background.js
 * Javascript file doing the background work for the addon
 */

/* ----- WebRequest Handling ----- */

var onBeforeRequestHandler = function (details) {
	try {
		var url = details.url;

		// redirect URL if we do not have mandator cookie
		// and if we have not yet redirected to the same URL including
		// parameters
		// lb_m and oid based on selected mandator
		if (/(html|jsp)/.test(url) && url.indexOf('lb_m') < 0) {
			var mandator = data.getCurrentMandator();
			var cookie = data.getCookie(url, "m");
			logger.log('trace', 'stored cookie: ' + cookie);
			if (mandator && mandator.id && (!cookie || cookie != mandator.id)) {
				var add;
				if (url.indexOf('?') < 0) {
					add = '?';
				} else {
					add = '&';
				}

				add += 'oid=' + mandator.oid + '&lb_m=' + mandator.id;
				if (url.indexOf(';') > 0) {
					var sub = url.split(';');
					url = sub[0] + add + ';' + sub[1];
				} else {
					url += add;
				}
				logger.log('log', 'redirect to: ' + url);
				return {
					"redirectUrl" : url
				};
			}
		}
	} catch (e) {
		logger.log('error', 'onBeforeRequestHandler unexpected error', e);
	}
};

var onBeforeHeadersHandler = function(details) {
	try {
		
	var headers = details.requestHeaders;
	var response = {};

//	alert('config: ' + data.storage.ereader + ' ua:' + data.config.ereader[data.storage.ereader].useragent);
	var ereader = data.getCurrentEreader();
	if (ereader != undefined && ereader.useragent != undefined) {
		addHeader(headers, 'User-Agent', ereader.useragent);
	}
	
	var token = data.getCurrentToken();
	if (token != undefined && token.access_token != undefined) {
		addHeader(headers, 'X-Access-Token', token.access_token);
	}
	response.requestHeaders = headers;
	return response;
	} catch (e) {
		alert('onBeforeheadersHandler error: ' + e);
	}
};

var onSendHeaders = function(details) {
	if (/(html|jsp)/.test(details.url) ) {
		var msg = '';
		var header;
		
		var i,l;
		for (i=0, l=details.requestHeaders.length; i<l; i++) {
			header = details.requestHeaders[i];
			if (header.name === 'Cookie') {
				msg += header.name + ': ' + header.value + ', ';
			}
		}
		alert('onSendHeaders: ('+details.requestHeaders.length+')' + msg);
	} 
}

var onHeadersReceived = function(details) {
	logger.log('trace', 'onHeadersReceived')
	logger.log('trace', details);
}



// filter - only filter requests from these url'
// note: same as within the manifest.json
var webRequestFilter =  { urls:[ "http://*/testpage/*", "https://*/testpage/*"
	, "http://*/*ThaliaShop/*", "https://*/*ThaliaShop/*"
	, "http://*/ebooks/*", "https://*/ebooks/*" ]
}

function initBackground(enabled) {
try {
	
	if (enabled) {
		chrome.webRequest.onBeforeRequest.addListener(
				onBeforeRequestHandler
				,  webRequestFilter
				, ['blocking']
		);

		chrome.webRequest.onBeforeSendHeaders.addListener(
				onBeforeHeadersHandler
		        , webRequestFilter
		        , ['requestHeaders', 'blocking']
		        );
		chrome.webRequest.onHeadersReceived.addListener(
				onHeadersReceived
				, webRequestFilter
				, ['blocking']
		);
		

//		chrome.webRequest.onSendHeaders.addListener(
//				onSendHeaders, webRequestFilter, ['requestHeaders']
//				);
		
	} else {
		chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestHandler);
		chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeHeadersHandler);
	}
} catch (e) {
	alert('error on background init: ' +e);
}
}

data.addOnInit(function() {
	initBackground(data.isEnabled());
});

data.register('enabled', 'storage', initBackground);

/*  ----- message handler ------ */

var messageHandlers = messageHandlers || {
	_handlers : {}
	, register : function (type, fn) {
		var h = this._handlers[type] || [];
		if (h.indexOf(fn) === -1) {
			h.push(fn);
		}
	}, unregister(type, fn) {
		var h = this._handlers[type];
		if (h) {
			var idx = h.indexOf(fn);
			if (idx > -1) {
				h.splice(idx,1);
			}
		}
	}, on : function(message, sender, sendResponse) {
		var h = this._handlers[message.type];
		if (h) {
			var i,l;
			for (i=0, l=h.length; i<l; i++) {
				h[i](message, sender, sendResponse);
			}
		} else {
			logger.warn('received unhandled message' 
					+ ( message.type || message)
					);
		}
	}
}



chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	var ereader = data.getCurrentEreader();
	var mandator = data.getCurrentMandator();
//	var token = customer[data.storage.mandator];
	messageHandlers.on(message, sender, sendResponse);
	if (message.type == 'login') {
		var url = 'https://integration.buch.de/auth/oauth2/token?grant_type=password'
			+ '&username='  + message.username
			+ '&password='  + message.password
			+ '&client_id=' + ereader.clientId
			+ '&client_secret=' + ereader.clientSecret
			+ '&scope=SCOPE_BOSH%20SCOPE_BUCHDE'
			+ '&x_buchde.mandant_id=' + mandator.id;
		logger.log('login', 'info', 'requesting login: ' + url);
		$.ajax({
	        'async': true,
	        'global': false,
	        'url': url,
	        'dataType': "json",
	        'success': function (token) {
	        	logger.log('login', 'info', 'received token');
	        	data.setCurrentToken(token, function() {
	        		var customer = {'username' : message.username, 'password': message.password};
		        	data.setCurrentCustomer(customer, function(){
		        		sendResponse({'type':'login', 'success': true})
		        	});
	        	});
	          },
	        'error': function(data, status, error) {
	        	
	        	if (typeof data === 'object') {
	        		
	        	}
	        	logger.log('login', 'error', 'login request failed:'
	        			+ ' error: ' + error 
	        			+ ' status:' + status
	        			+ ' data: ' + data);
	        	sendResponse({"type": 'login'
	        				, 'success': false
	        				, 'error'  : error
	        				, 'status' : status
	        				, 'data'   : data
	        				});
	        			}
		});
		return true;
	} else {
		sendResponse({"type" : message.type, "success" : false, 'error':'unkonwn type'});
	}
});



/* ----- Helper Functions -----*/

function addHeader(headers, name, value) {
	if (value != undefined  && value != '') {
		var isSet = false;
		for (var i = 0, l = headers.length; i < l; ++i) {
			if (headers[i].name === name) {
				headers[i].value = value;
				isSet = true;
			}
		}
		
		if (!isSet) {
		    headers.push({
		        "name": name,
		        "value": value
		    });
			
		}
	}
}
