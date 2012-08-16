var storageKeys = {
	preferences: "prefs",
}

function loadPreferences(callback){
	chrome.storage.local.get(
		storageKeys.preferences, 
		function(items){
			var preferences = null; 
			if(storageKeys.preferences in items){
				preferences = items[storageKeys.preferences];
			}
			else{
				preferences = {presets: []};
			}
			chrome.extension.sendMessage({preferences: preferences});
			if(callback){
				callback(preferences);
			}
		});	
}

function savePreferences(prefs, callback){
	var key = {}; 
	key[storageKeys.preferences] = prefs;
	chrome.storage.local.set(
		key, 
		function(){ 
			chrome.extension.sendMessage({preferences: prefs});
			if(callback){
				callback();
			}
		});
}		
