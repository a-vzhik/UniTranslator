var wordReferenceApiKey = "00ecd";
var menuItemsData = null;

chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.preferences){
			chrome.contextMenus.removeAll(function(){ menuItemsData = createContextMenu(request.preferences.presets);});
		}
	});

function createContextMenu(presets){
	var context = "selection";
	
	if(presets.length == 0)
	{
		chrome.contextMenus.create({ "title": "Create translation presets...", "contexts": [context], "onclick": onOptionsMenuItemClick });
		return null;
	}
	else
	{
		var menuItems = new Dictionary();
		var parentTitle = "Translate with";
		var parent = chrome.contextMenus.create({ "title": parentTitle, "contexts": [context] });

		presets.each(function(preset){
			var id = chrome.contextMenus.create({ "title": String.format("{0} [{1} > {2}]", preset.service, preset.source, preset.target),
				"contexts": [context],
				"parentId": parent,
				"onclick": onTranslateMenuItemClick
			});
			
			menuItems.store(id, preset);
		});
		return menuItems;
	}
}

loadPreferences();

function onTranslateMenuItemClick(info, tab) {
	var preset = menuItemsData.lookup(info.menuItemId);
	var service = availableServices
		.where(function(s){return preset.service == s.name;})
		[0]; 

	service.translate(info.selectionText, preset.source, preset.target, function(card){	
		var key = "translated";
		var items = {};
		items[key] = card;
		chrome.storage.local.set(
			items, 
			function() { 
				var codeToExecute = String.format('popupTranslation("{0} [{1} -> {2}]","{3}")', info.selectionText, preset.source, preset.target, key);
				chrome.tabs.executeScript(tab.id, { code: codeToExecute }, function(){console.log("Code executed")});
			});
	});
}

function onOptionsMenuItemClick(info, tab){
	chrome.tabs.create({url: chrome.extension.getURL("options.html")})
}