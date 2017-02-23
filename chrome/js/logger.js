/**
 * Logger class used for logging background events in console.
 * 
 *  the logger.js is also injected into the target page 
 *  where the log-output is acheived with console.log
 */

const STACK_FRAME_RE = /^\s*at( ([^.]+\.)?(.+))? \(?([^:]+:[^:]+):(\d+):(\d+)\)?$/;


const CURRENT_FILE = 'logger.js';

const LOG_LEVELS = 'trace, debug, log, info, warn, error';

var logger = logger || {
	_logLevel : 0
	, init : function(lvl) {
		if (lvl) {
			this._logLevel = LOG_LEVELS.indexOf(lvl);
			this.log('trace', 'init at log-level: ' + lvl + ' idx: ' + this.logLevel);
		}
	}
	, trace(msg, e) {
		try {
			this.log('trace', msg, e);
		} catch (e) {
			alert(e);
		}
	}, debug(msg, e) {
		this.log('debug', msg, e);
	}, info (msg, e) {
		this.log('info', msg, e);
	}, warn(msg, e) {
		this.log('warn', msg, e);
	}, error(msg, e) {
		this.log('error', msg, e);
	}

	, log : function(lvl, msg, ex) {
		try {
			if (ex) {
				msg += ' error: ' + ex;
			}

			if (LOG_LEVELS.indexOf(lvl) === -1) {
				this.log('warn', 'unkown log-level: "'+lvl+'"');
				lvl = 'log';
			}
			
			if (this._logLevel <= LOG_LEVELS.indexOf(lvl)) {
				var request = {
							info : this._getCaller(ex),
							level : lvl,
							message : msg,
							at : util.time()
				};
	
				if (console) {
					var info = request.info?(request.info.module + ':' + request.info.line + '/' + request.info.column):'';
					console[lvl](request.at + ' ' 
							+  '['+ request.level +'] '
							+ info
							+ ' -> ' + request.message);
				}
				
				if (chrome && chrome.tabs && chrome.tabs.query) {
					chrome.tabs.query({	active : true, currentWindow : true	}, function(tabs) {
						chrome.tabs.sendMessage(tabs[0].id, request);
					});
				}
			}
			
		} catch (e) {
			alert('exception occured within log, error: ' + e);
		}
	}
	
	
	  , _getCaller: function(err) {
		    err =  err || new Error();
		    Error.captureStackTrace(err);

		    // Throw away the first line of the trace
		    var frames = err.stack.split('\n').slice(1);
		    // Find the first line in the stack that doesn't name this module.
		    var callerInfo = null;
		    var f, fl;
		    for (var f = 0, fl = frames.length; f < fl; f++) {
		    	// use first caller-info that is not from the current file (logger.js)
		    	if (frames[f].indexOf(CURRENT_FILE) === -1) {
			        callerInfo = STACK_FRAME_RE.exec(frames[f]);
			        break;
		    	}
		    }

		    if (callerInfo) {
		      return {
		        function: callerInfo[3] || null,
		        module: callerInfo[4]   || null,
		        line: callerInfo[5]     || null,
		        column: callerInfo[6]   || null
		      };
		    }
		    return null;
		  }
};


(function() {
	if (console && chrome && chrome.runtime && chrome.runtime.onMessage) {
		chrome.runtime.onMessage.addListener(function(request, sender) {
			var info = request.info?( (request.info.module || '-')
						+ (':' + request.info.function || '-')
						+ ':' + request.info.line + '/' + request.info.column):'';
			console[request.level](request.at + ' ' 
					+  '['+ request.level +'] '
					// + request.info.module + ':' + request.info.line + '/' + request.info.column 
					+ info
					+ ' -> ' + request.message);		});
	}
})();