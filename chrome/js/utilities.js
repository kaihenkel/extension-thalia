var util = util || {

	extractDomain : function (url) {
	    var domain;
	    //find & remove protocol (http, ftp, etc.) and get domain
	    if (url.indexOf("://") > -1) {
	        domain = url.split('/')[2];
	    }
	    else {
	        domain = url.split('/')[0];
	    }

	    //find & remove port number
	    domain = domain.split(':')[0];
	    return domain;
	}

	, timestamp : function (from) {
		from = from || new Date();
		// Create an array with the current month, day and time
		var date = [ from.getFullYear(), from.getMonth() + 1, from.getDate() ];

		// Create an array with the current hour, minute and second
		var time = [ from.getHours(), from.getMinutes(), from.getSeconds() ];

		var ms = from.getMilliseconds();
		if (ms < 100) {
			ms = "00" + ms;
		} else if (ms < 10) {
			ms = "0" + ms;
		}
		// If seconds and minutes are less than 10, add a zero
		var i;
		for (i = 1; i < 3; i++) {
			if (time[i] < 10) {
				time[i] = "0" + time[i];
			}

			if (date[i] < 10) {
				date[i] = "0" + date[i];
			}
		}
		// Return the formatted string
		return date.join("-") + " " + time.join(":") + "." + ms;
	}
	
	, time : function(from) {
		from = from || new Date();
		// Create an array with the current hour, minute and second
		var time = [ from.getHours(), from.getMinutes(), from.getSeconds() ];

		var ms = from.getMilliseconds();
		if (ms < 100) {
			ms = "0" + ms;
		} else if (ms < 10) {
			ms = "00" + ms;
		}
		// If seconds and minutes are less than 10, add a zero
		var i;
		for (i = 1; i < 3; i++) {
			if (time[i] < 10) {
				time[i] = "0" + time[i];
			}
		}
		// Return the formatted string
		return  time.join(":") + "." + ms;
		
	}


};