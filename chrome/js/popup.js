var config;

/* ----- Init ----- */
$(document).ready(function(){
	logger.init('popup');
	
	$('#options').click(function() {
		  if (chrome.runtime.openOptionsPage) {
		    // New way to open options pages, if supported (Chrome 42+).
		    chrome.runtime.openOptionsPage();
		  } else {
		    // Reasonable fallback.
		    window.open(chrome.runtime.getURL('options.html'));
		  }
	});
	
	$('#apply').click(function() {
		if (data.isEnabled()) {
			storeData();
		}
	});
	
	$('#login').click(function() {
		if (data.isEnabled()) {
			storeData(function() {
				$('#message').html('Login Data Requested');
				
				chrome.runtime.sendMessage({type: "login"
							, 'username': $('#username').val()
							, 'password':$('#password').val()}, function(response) {
					if(response.success) {
						$('#message').html('Login Successfull');
					} else {
						$('#message').html('Login Failed: ' + response.error)
					}
				});
			});
		}
	});
	
	$('#mandator, #eReader').change(function() {
		$('#config').addClass('modified');
	});

	$('#username, #password').keypress(function() {
		$('#customer').addClass('modified');
	});
	
	$('#logout').click(function() {
		chrome.storage.local.remove('token');
	});
	
	
	$('#test').click(function() {
		try {
			lgger.log('info', 'test');
		} catch (ex) {
			logger.log('error', 'Unexpected Exception', ex);
		}
//		if (data.isEnabled()) {
//			alert('Data Info:' + data.getInfo() );
//		}
	});
	
	$('#enable').click(function() {
		var val = !data.isEnabled();
		data.setEnabled(val, updateUI );
	});

	chrome.storage.onChanged.addListener(function(changes, namespace) {
	    for (key in changes) {
	      var storageChange = changes[key];
	      console.log('Storage key "%s" in namespace "%s" changed. ' +
	                  'Old value was "%s", new value is "%s".',
	                  key,
	                  namespace,
	                  storageChange.oldValue,
	                  storageChange.newValue);
	      
	    }
	    updateUI();
	  });
	

	// init drop-down 
    $.ajax({
        'async': false,
        'global': false,
        'url': 'res/data.json',
        'dataType': "json",
        'success': function (data) {
            populateSelect("#mandator", 'mandator', data.mandator);
            populateSelect("#eReader", 'ereader', data.ereader);
            config = data;
        }
    });

    data.addOnInit(updateUI);
    
//    chrome.storage.local.get('customer', function(data) {
//    	var customer = data.customer;
//    	$('#username').val(customer.username);
//    	$('#password').val(customer.password);
//    });
    
    
	function populateSelect(select, key, src) {
		$.each(src, function(name, value) {
			$(select).append("<option value='" + name +"'>" + value.name +"</option>" );
		});
		
		chrome.storage.local.get(key, function(result) {
			if (result[key] !== '') {
				var option = select + " option[value='"+result[key]+"']";
				$(option).prop('selected', true);
			}
		});
	};
	

	function updateUI() {
		var enabled = data.isEnabled();
		if (enabled) {
			$('body').removeClass('disabled');
			$('input:not(#enable), select').prop('disabled', false);
			$('#enable').prop('value', 'disable');
		} else {
			$('body').addClass('disabled');
			$('input:not(#enable), select').prop('disabled', true);
			$('#enable').prop('value', 'enable');
		}
		
		$('#config').removeClass('modified');
		
		var customer = data.getCurrentCustomer();
		if (customer) {
			$('#username').val(customer.username);
			$('#password').val(customer.password);

			var token = data.getCurrentToken();
			if (token) {
				$('#status').html('Logged in with customerId: ' + token["x_buchde.user_id"]);
			} else {
				$('#status').html('Not Logged in');
			}
		}

		} chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
			var url = tabs[0].url;
			
			
			console.log('current url: ['+tabs.length+']' + url);
			var $info = $('#info');
			$info.html ('');
			if (url) {
				$info.append('<div>url: ' + url + '</div>');
				$info.append('<div>cookie m: ' + data.getCookie(url, "m")+'</div>')
			}
		});
	
});


function storeData(fn) {
	data.setCurrentEreader($('#eReader').val(), function() {
		data.setCurrentMandator($('#mandator').val(), fn);
	});
}



/* message handling */
chrome.runtime.onMessage.addListener(
		  function(request, sender, sendResponse) {
			  $('#message').html('Received Message: ' + request.type);
		  });
