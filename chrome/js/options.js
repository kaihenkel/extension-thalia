var options = options || {
	_config : {}
	
	, init : function() {
		message('init');
		chrome.storage.local.get('config', function(items) {
			try {
				options._process(items.config || {});
			} catch (e) {
				message('error during inti: ' +e);
			}
		});
	}

	, load : function (file) {
		if (file) {
			var reader = new FileReader();
			reader.onloadend = function(event) {
				if (event.target.readyState == FileReader.DONE) {
					var key;
					for(key in event.target) {
						console.log(key + ' -> ' + event.target[key]);
					}
					options._process(JSON.parse(event.target.result), file);
				}
			}

			reader.readAsText(file);
		}
	} 
	, _update(source, destination) {
		try {
			message('updating');
			destination = destination || {};
			if (source) {
				var v, c, k, key, state;
				for (key in source) {
					c = destination[key] || {};
					v = source[key];
					if (!source[k]) {
						c.state = 'new';
					} else {
						delete c.state;
					}
					
					for (k in v) {
						if (!c[k] || c[k] != v[k]) {
							state = 'modified';
						}
						c[k] = v[k];
					}
				}
			}
			return destination;
		} catch (e) {
			message('error updatetin option, error: ' + e);
		}
		
	}
	, _process(cfg, file) {
		if (file) {
			message('processing file:' + file);
		}
		try {
			options._config.ereader  = options._update(options._config.ereader, cfg.ereader);
			options._config.mandator = options._update(options._config.mandator, cfg.mandator);
		} catch (e) {
			message('error in _process: ' + e);
		}
	}
}



	
$(document).ready(function(){
	options.init();
	$('#options-file').on('change', function(event) {
		try {
			
			var files = event.target.files;
			if (files ) {
				var i, l = files.length;
				for (i=0; i<l; i++) {
					try {
						options.load(files[i]);
					} catch (e) {
						message('error while loading file, error: ' +e);
					}
				}
			}		
		} catch (e) {
			message('error: ' + e);
		}
	});
});


function message(msg) {
	$('#messages').find('ul').append('<li>' + util.time() + ': ' + msg + '</li>');
}
