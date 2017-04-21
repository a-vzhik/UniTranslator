var CREATE_NEW_PRESET_ID = "Create_New_Preset_Id";
var CREATE_NEW_PRESET_TITLE = "Create a new preset...";


function createContextMenu (presets) {
	var context = "selection";
	
	if (presets.length == 0) {
		chrome.contextMenus.create({ 
			"id": CREATE_NEW_PRESET_ID,
			"title": CREATE_NEW_PRESET_TITLE, 
			"contexts": [context], 
		});
		return null;
	}
	else {
		var parentTitle = "UniTranslator: translate with";
		var parent = chrome.contextMenus.create({ 
			"title": parentTitle,
			"contexts": [context] 
		});

		presets.each(function (preset) {
			var id = chrome.contextMenus.create({ 
				"id": preset.id,
				"title": String.format("{0} [{1} > {2}]", preset.service, preset.source, preset.target),
				"contexts": [context],
				"parentId": parent
			});
		});
		
		chrome.contextMenus.create({ 
			"id": CREATE_NEW_PRESET_ID,
			"title": CREATE_NEW_PRESET_TITLE, 
			"contexts": [context], 
			"parentId": parent, 
		});
	}
}

function onTranslateMenuItemClick (info, tab) {
	loadPreferences(function (prefs) {
		var presetId = info.menuItemId;

		var preset = prefs.presets
			.where(function (p) { return p.id == presetId; })
			.firstOrNull();

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
	});
}

function onOptionsMenuItemClick () {
	chrome.tabs.create({
		url: chrome.extension.getURL("options.html")
	})
}

function refreshContextMenu (preferences) {
	chrome.contextMenus.removeAll(function () { 
		if (preferences) {
			createContextMenu(preferences.presets);
		}
	});
}

chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		refreshContextMenu(request.preferences);
	});

chrome.contextMenus.onClicked.addListener(function(info, tab){
	if (info.menuItemId == CREATE_NEW_PRESET_ID) {
		onOptionsMenuItemClick(info, tab);
	}
	else {
		onTranslateMenuItemClick(info, tab);
	}
});

loadPreferences(function (prefs) {
	refreshContextMenu(prefs);
});