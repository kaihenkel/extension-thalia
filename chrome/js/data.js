/**
 * global available data - content:
 * storage : data synchronized with local storage
 * config : configuration data - loaded from res/data.json - do not store information here
 * cookies[domain]: available cookies for the given domain
 * 
 * 
 * storage.mandator: the currently selected mandator (key for data.config.mandator)
 * storge.ereader: the currently selected ereader (key for data.config.ereader)
 * storage.customer[mandator]: customer related data for the given mandator
 * storage.customer[mandator][ereader]: token for the current mandator/ereader 
 */
var data = data || {
	
	// TODO: change settings setter to contain additional parameter for writing to storage
	// write all data at once to ensure that we receive a difference, write current timestamp
	
	getCurrentMandator : function() {
		return this.config.mandator[this.storage.mandator];
	}, setCurrentMandator(mandator, fn) {
		chrome.storage.local.set({'mandator': mandator}, fn);
	}, setCurrentMandatorById(id, fn) {
		var msg = ''; 
		$.each(config.mandator, function(key, value) {
			if (value.id == id) {
				data.setCurrentMandator(key, fn);
			}
		});
	}

	, getCurrentEreader : function() {
		return this.config.ereader[this.storage.ereader];
	}, setCurrentEreader : function(ereader, fn) {
		chrome.storage.local.set({'ereader': ereader}, fn);
	}
	
	, getCurrentToken : function() {
		if (this.storage.token) {
			var tokens = this.storage.token[this.storage.mandator];
			if (tokens) {
				return tokens[this.storage.ereader];
			}
		}
		return undefined;
	}, setCurrentToken : function(token, fn) {
		var t = this.storage.token || {};
		t[this.storage.mandator] = t[this.storage.mandator] || {};  
		t[this.storage.mandator][this.storage.ereader] = token;
		chrome.storage.local.set({'token' : t}, fn);
	}
	
	, getCurrentCustomer : function() {
		return this.storage.customer[this.storage.mandator];
	}, setCurrentCustomer : function(customer, fn) {
		var c = this.storage.customer || {};
		c[this.storage.mandator] = customer;
		chrome.storage.local.set({'customer' : c}, fn);
	}
	
	, getCookies : function(url) {
		var domain = util.extractDomain(url);
		return this.cookies[domain];
	}, getCookie : function(url, name) {
		var cookies = this.getCookies(url);
		if(cookies) {
			return cookies[name];
		}
		return undefined;
	}, initCookie : function(name) {
		chrome.cookies.getAll(
				{ "name": name}
				, function(cookies) {
					data.cookies = data.cookies || {};
					var c;
					for (var i=0, l=cookies.length; i<l; ++i) {
						c = cookies[i];
						var domain = data.cookies[c.domain] || {};
						domain[name] = c.value;
						data.cookies[c.domain] = domain;
					}
				});
		
	}
	
	
	, isEnabled : function() {
		return this.storage.enabled;
	}, setEnabled : function(val, fn) {
		this.storage.enabled = val;
		chrome.storage.local.set({'enabled' : val}, fn);
	}
	
	, getInfo : function () {
		return 'ereader:' + this.getCurrentEreader().name
		        + ' mandator: ' + this.getCurrentMandator().name
		        ;
	}
	, init : false
	, onInit : []
	, addOnInit : function (fn) {
		this.onInit.push(fn);
		if (this.init) {
			fn();
		}
	}
	, handlers : {}
	, register : function (name, type, fn) {
		var types = this.handlers[type] || {};
		var names = types[name] || [];
		names.push(fn);
		types[name] = names;
		this.handlers[type] = types;
	}, unregister: function (name, type, fn) {
		var types = this.handlers[type];
		if (types != undefined) {
			var names = types[name];
			if (names != undefined) {
				var idx = names.indexOf(fn);
				if (idx > -1) {
					names.splice(idx,1);
				}
			}
		}
	}
};

//----- cookie handling -----
chrome.cookies.onChanged.addListener(function (details) {
	var c = details.cookie;
	if (details.removed && data.cookies[c.domain] != undefined) {
		delete data.cookies[c.domain];
		logger.log('trace', 'removed cookie ' + c.name + '[' + c.domain + ']');
	} else {
		switch(c.name) {
		case 'm':
			break;
		}
		data.cookies[c.domain] = c.value;
		logger.log('trace','add cookie: ' + c.name + '[' + c.domain + '] = ' + c.value );
	}
});

// ----- storage handling -----
chrome.storage.onChanged.addListener(function(changes, namespace) {
	if (data.init) {
		var handlers = data.handlers.storage;
		for (key in changes) {
	    	data.storage[key] = changes[key].newValue;
	    	if (handlers != undefined && handlers[key] != undefined) {
	    		var h = handlers[key];
	    		var i,l;
	    		for (i=0, l=h.length;i<l; i++) {
	    			h[i](changes[key].newValue);
	//    			alert('onChange: ' + key + '/' + changes[key].newValue 
	//    					+ ' handler ['+i+'] :' + h[i]);
	    		}
	    	}
	    }
	}
  });

/* ----- init data ----- */
(function() {
	console.log('init data');
    $.ajax({
        'async': false,
        'global': false,
        'url': 'res/data.json',
        'dataType': "json",
        'success': function (d) {
            data.config = d;
         }
    });

	chrome.storage.local.get(function(result) {
		data.storage = result;
		
		data.init = true;
		
		
		var i,l;
		for (i=0, l=data.onInit.length; i<l; i++) {
			data.onInit[i]();
		}

//		alert('init data.storage: ' + data.storage.ereader + ' - ' + data.storage.mandator);
	});
	
	
	data.initCookie("m");

}());

