var wordReferenceApiKey = "00ecd";
var menuItemsData = null;

chrome.extension.onMessage.addListener(
	function (request, sender, sendResponse) {
		if (request.preferences) {
			chrome.contextMenus.removeAll(function () { 
				menuItemsData = createContextMenu(request.preferences.presets);
			});
		}
	});

function createContextMenu (presets) {
	var context = "selection";
	
	if (presets.length == 0) {
		chrome.contextMenus.create({ 
			"title": "UniTranslator: create a new preset...", 
			"contexts": [context], 
			"onclick": onOptionsMenuItemClick 
		});
		return null;
	}
	else {
		var menuItems = new Dictionary();
		var parentTitle = "UniTranslator: translate with";
		var parent = chrome.contextMenus.create({ 
			"title": parentTitle,
			"contexts": [context] 
		});

		presets.each(function (preset) {
			var id = chrome.contextMenus.create({ 
				"title": String.format("{0} [{1} > {2}]", preset.service, preset.source, preset.target),
				"contexts": [context],
				"parentId": parent,
				"onclick": onTranslateMenuItemClick
			});
			
			menuItems.store(id, preset);
		});
		
		chrome.contextMenus.create({ 
			"title": "Create a new preset...", 
			"contexts": [context], 
			"parentId": parent, 
			"onclick": onOptionsMenuItemClick 
		});
		
		return menuItems;
	}
}

function onTranslateMenuItemClick (info, tab) {
	var preset = menuItemsData.lookup(info.menuItemId);
	var service = availableServices
		.where(function (s) {
			return preset.service == s.name;
		})[0]; 

	service.translate(
		info.selectionText, 
		preset.source, 
		preset.target, 
		function (card, uri) {	
			var key = "translated";
			var items = {};
			items[key] = card;
			chrome.storage.local.set(
				items, 
				function () { 
					var codeToExecute = String.format(
						'showTranslation("{0} [{1} -> {2}]", "{3}", "{4}")', 
						info.selectionText, 
						preset.source, 
						preset.target, 
						key,
						uri);
					chrome.tabs.executeScript(tab.id, 
						{
							code: codeToExecute 
						});
				});
		});
}

function onOptionsMenuItemClick (info, tab) {
	chrome.tabs.create({
		url: chrome.extension.getURL("options.html")
	})
}

loadPreferences();