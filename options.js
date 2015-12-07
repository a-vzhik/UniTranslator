var languages = ["English", "Russian", "French", "German", "Italian", "Spanish"];

var preferences = null;

chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		//console.log(JSON.stringify(request));
		if (request.contains("preferences")) {
			preferences = request.preferences;
			invalidatePresets(request.preferences.presets);
		}
	});

function Preset (from, to, serviceId) {
	this._from = from;
	this._to = to; 
	this._serviceId = serviceId; 
}

function createGuid() {
    function S4() {
       return (((1+Math.random())*0x10000) | 0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function selectLanguage (point, languageSelectedCallback) {
	$("#languages").detach();
	
	var languagesHtml = languages
		.map(function (l) {
			return "<div><a href='#selectLanguage'>"+l+"</a></div>"
		})
		.join("");
		
	var html = "<div id='languages'>"+languagesHtml+"</div>";
	$("#options").append(html);
		
	$("#languages").css('left', point.x);
	$("#languages").css('top', point.y);
	
	$("#languages a").click(function (e) {
		languageSelectedCallback($(e.target).html());
	});
}

function selectService (source, target, point, serviceSelectedCallback) {
	var selector = "#services";
	$(selector).detach();
	
	var servicesHtml = availableServices
		.where(function (item) {
			return item.isSourceLanguageSupported(source) && item.isTargetLanguageSupported(target); 
		})
		.map(function (s) {
			return "<div><a href='#selectService'>"+s.name+"</a></div>";
		})
		.join("");
		
	$("#options").append(
		$("<div>")
			.attr("id", "services")
			.css('left', point.x)
			.css('top', point.y)
			.append(servicesHtml));
		
	$(selector + " a").click(function (e) {
		serviceSelectedCallback($(e.target).html());
	});
}

function fixService (preset) {
	// If the current service supports both languages - there is no need to change a service
	var activeService = availableServices.where(function (s) {
		return s.name == preset.service;
	})[0];
	if (activeService.isSourceLanguageSupported(preset.source) 
		&& activeService.isTargetLanguageSupported(preset.target)) {
		return;
	}
	
	// If the current service doesn't support both languages - we have to find a first service that does.
	preset.service = availableServices
		.where(function (item) {
			return item.isSourceLanguageSupported(preset.source) && item.isTargetLanguageSupported(preset.target); 
		})[0]
		.name;
}

function renderPreset (preset, target) {
	var html = String.format(
		"<div id='{3}'>From <a href='#changeSource'>{0}</a> to <a href='#changeTarget'>{1}</a> with service <a href='#changeService'>{2}</a> [<a href='#removePreset'>remove</a>]</div>", 
		preset.source, 
		preset.target, 
		preset.service, 
		preset.id);
	$(target).append(html);
	
	var presetSelector = "#"+ preset.id;
	
	$(presetSelector + " a[href='#changeSource']").click(function (e) {
		e.stopPropagation();
		selectLanguage(
			{
				x: e.clientX, 
				y: e.clientY
			}, 
			function (language) {
				preset.source = language;
				fixService(preset);
				savePreferences(preferences);
			});
	});
	
	$(presetSelector + " a[href='#changeTarget']").click(function (e) {
		e.stopPropagation();
		selectLanguage(
			{
				x: e.clientX, 
				y: e.clientY
			}, 
			function (language) {
				preset.target = language;
				fixService(preset);
				savePreferences(preferences);
			});
	});
	
	$(presetSelector + " a[href='#changeService']").click(function (e) {
		e.stopPropagation();
		selectService(
			preset.source, 
			preset.target,
			{
				x: e.clientX, 
				y: e.clientY
			}, 
			function (service) {
				preset.service = service;
				savePreferences(preferences);
			});
	});	
	
	$(presetSelector + " a[href='#removePreset']").click(function () {
		preferences.presets.remove(preset);
		savePreferences(preferences);
	});	
}

function renderPreset2 (preset, target) {
	console.log(preset.id);
	
	$("#presets").append(
		$("<tr>").attr("class", "preset").attr("id", preset.id)
			.append($("<td>")
				.append($("<a>").attr("href", "#changeSource")
					.append(preset.source)))
			.append($("<td>")
				.append($("<a>").attr("href", "#changeTarget")
					.append(preset.target)))
			.append($("<td>")
				.append($("<a>").attr("href", "#changeService")
					.append(preset.service)))
			.append($("<td>")
				.append($("<a>").attr("href", "#removePreset")
					.append($("<img>").attr("src", "media/icons/close-32.png"))))
	)
	
	var presetSelector = String.format("#{0}", preset.id);
	
	var changeSourceSelector = String.format("{0} a[href='#changeSource']", presetSelector); 	
	$(changeSourceSelector).click(function (e) {
		e.stopPropagation();
		selectLanguage(
			{
				x: e.clientX, 
				y: e.clientY
			}, 
			function (language) {
				preset.source = language;
				fixService(preset);
				savePreferences(preferences);
			});
	});
	
	var changeTargetSelector = String.format("{0} a[href='#changeTarget']", presetSelector);
	$(changeTargetSelector).click(function (e) {
		e.stopPropagation();
		selectLanguage(
			{
				x: e.clientX, 
				y: e.clientY
			}, 
			function (language) {
				preset.target = language;
				fixService(preset);
				savePreferences(preferences);
			});
	});
	
	var changeServiceSelector = String.format("{0} a[href='#changeService']", presetSelector);
	$(changeServiceSelector).click(function (e) {
		e.stopPropagation();
		selectService(
			preset.source, 
			preset.target,
			{
				x: e.clientX, 
				y: e.clientY
			}, 
			function (service) {
				preset.service = service;
				savePreferences(preferences);
			});
	});	
	
	var removeSelector = String.format("{0} a[href='#removePreset']", presetSelector);
	$(removeSelector).click(function () {
		preferences.presets.remove(preset);
		savePreferences(preferences);
	});
}

function destroyChildren (node) {
	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
}

function invalidatePresets (presets) {
	$("#presets tr.preset a").unbind('click');
	$("#presets tr.preset").detach();

	var target = $("#presets");
	target.css("display", presets.length == 0 ? "none" : "table");
	presets.each(function (p) {
		renderPreset2(p, target);
	});
}

function removeNode (id) {
	var node = document.getElementById(id);
	if (node) {
		var parent = node.parentNode || document.documentElement ;
		parent.removeChild(node);
	}	
}


$(document).ready(function () {
	loadPreferences();
		
	$("#create-preset").click(function () {
		var preset = {
			source:languages[0], 
			target:languages[0], 
			service:availableServices[0].name, 
			id:createGuid()
		};
		
		fixService(preset);
		preferences.presets.push(preset);
		savePreferences(preferences);
	});

	$("#remove-all-presets").click(function () {
		chrome.storage.local.clear(function () {
			preferences.presets = [];
			savePreferences(preferences);
		});
	});
	
	$(document).click(function () {
		$("#languages").detach();
		$("#services").detach();
	});
});
