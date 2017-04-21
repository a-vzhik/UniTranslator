var storageKeys = {
	preferences: "prefs",
}


chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		console.log(request);
	});

function loadPreferences (callback) {
	console.log("loadPreferences");
	chrome.storage.local.get(
		storageKeys.preferences, 
		function (items) {
			var preferences = null; 
			if (storageKeys.preferences in items) {
				preferences = items[storageKeys.preferences];
			}
			
			if (preferences == null) {  
				preferences = {
					presets: []
				};
			}
			
			chrome.runtime.sendMessage({
				preferences: preferences
			});

			if (callback) {
				callback(preferences);
			}
		});	
}

function savePreferences (prefs, callback) {
	var key = {}; 
	key[storageKeys.preferences] = prefs;
	chrome.storage.local.set(
		key, 
		function () { 
			chrome.runtime.sendMessage({
				preferences: prefs
			});
			if (callback) {
				callback();
			}
		});
}		
