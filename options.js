var preferences = null;

chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		//console.log(JSON.stringify(request));
		if (request.contains("preferences")) {
			preferences = request.preferences;
			invalidatePresets(preferences.presets);
		}
	});

function createGuid() {
    function S4() {
       return (((1+Math.random())*0x10000) | 0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function selectLanguage (languages, point, languageSelectedCallback) {
	$("#languages").detach();
	
	var languageDivs = languages
		.map(function (l) {
			return $("<div>")
				.append($("<a>")
					.attr("href", "#selectLanguage")
					.append(l));
		})
		.aggregate($(), function (result, item) { 
			return result.add(item); 
		});
		
	$("#options").append($("<div>")
		.attr("id", "languages")
		.css("left", point.x)
		.css("top", point.y)
		.append(languageDivs));
		
	$("#languages a").click(function (e) {
		languageSelectedCallback($(e.target).html());
	});
}

function selectService (source, target, point, serviceSelectedCallback) {
	$("#services").detach();
	
	var serviceDivs = availableServices
		.where(function (item) { return item.areLanguagesSupported(source, target); })
		.map(function (s) {	
			return $("<div>")
				.append($("<a>")
					.attr("href", "#selectService")
					.append(s.name));
		 })
		.aggregate($(), function (result, item) { 
			return result.add(item); 
		});
		
	$("#options").append($("<div>")
		.attr("id", "services")
		.css('left', point.x)
		.css('top', point.y)
		.append(serviceDivs));
		
	$("#services a").click(function (e) {
		serviceSelectedCallback($(e.target).html());
	});
}

function fixService (preset) {
	// If the current service supports both languages - there is no need to change a service
	var activeService = availableServices
		.where(function (s) { return s.name == preset.service; })
		.firstOrNull();

	if (activeService != null &&
		activeService.areLanguagesSupported(preset.source, preset.target)) {
		return;
	}
	
	// If the current service doesn't support both languages - we have to find a first service that does.
	var candidates = availableServices
		.where(function (item) {
			return item.areLanguagesSupported(preset.source, preset.target); 
		});
	preset.service = candidates.any() ? candidates[0].name : null;
}

function renderPreset (preset, target) {
	$("#presets").append(
		$("<tr>")
			.attr("class", "preset")
			.attr("id", preset.id)
			.attr("valign", "middle")
			.append($("<td>")
				.append($("<a>")
					.attr("href", "#changeSource")
					.append(preset.source)))
			.append($("<td>")
				.append($("<a>")
					.attr("href", "#changeTarget")
					.append(preset.target)))
			.append($("<td>")
				.append(preset.service == null 
					? "No service"
					: $("<a>")
						.attr("href", "#changeService")
						.append(preset.service)))
			.append($("<td>")
				.append($("<a>")
					.attr("href", "#removePreset")
					.append($("<img>")
						.attr("src", "media/icons/close-32.png")
						.attr("width", "16")
						.attr("height", "16"))))
	)
	
	var presetSelector = String.format("#{0}", preset.id);
	
	var changeSourceSelector = String.format("{0} a[href='#changeSource']", presetSelector); 	
	$(changeSourceSelector).click(function (e) {
		e.stopPropagation();
		
		var sourceLanguages = availableServices
			.flatten(function (service) { return service.supportedLanguages; })
			.map(function (pair) { return pair[0]; })
			.distinct()
			.sort();		
		
		selectLanguage(
			sourceLanguages, 
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
		
		var targetLanguages = availableServices
			.flatten(function (service) { return service.supportedLanguages; })
			.map(function (pair) { return pair[1]; })
			.distinct()
			.sort();		
		
		selectLanguage(
			targetLanguages,
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
		renderPreset(p, target);
	});
}

$(document).ready(function () {
	loadPreferences();
		
	$("#create-preset").click(function () {
		var preset = {
			source: availableServices[0].supportedLanguages[0][0], 
			target: availableServices[0].supportedLanguages[0][1], 
			service: availableServices[0].name, 
			id: createGuid()
		};
		
		preferences.presets.push(preset);
		savePreferences(preferences);
	});

	$(document).click(function () {
		$("#languages").detach();
		$("#services").detach();
	});
});
