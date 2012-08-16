var languages = ["English", "Russian", "French", "German", "Italian", "Spanish"];

var preferences = null;

chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		//console.log(JSON.stringify(request));
		if(request.contains("preferences")){
			preferences = request.preferences;
			invalidatePresets(request.preferences.presets);
		}
	});

function Preset(from, to, serviceId){
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

function selectLanguage(point, languageSelectedCallback){
	$("#languages").remove();
	
	var languagesHtml = languages.map(function(l){return "<a href='#selectLanguage'>"+l+"</a>"}).join("<br/>");
	var html = "<div id='languages' style='padding:10px; background:white; border: solid 2px #CCC; position:absolute'>"+languagesHtml+"</div>";
	$(document.documentElement).append(html);
		
	$("#languages").css('left', point.x);
	$("#languages").css('top', point.y);
	
	$("#languages a").click(function(e){
		languageSelectedCallback($(e.target).html());
	});
}

function selectService(source, target, point, serviceSelectedCallback){
	var selector = "#services";
	$(selector).remove();
	
	var servicesHtml = availableServices
		.where(function(item){return item.isSourceLanguageSupported(source) && item.isTargetLanguageSupported(target); })
		.map(function(s){return "<a href='#selectService'>"+s.name+"</a>"})
		.join("<br/>");
		
	var html = "<div id='services' style='padding:10px; background:white; border: solid 2px #CCC; position:absolute'>"+servicesHtml+"</div>";
	$(document.documentElement).append(html);
		
	$(selector).css('left', point.x);
	$(selector).css('top', point.y);
	
	$(selector + " a").click(function(e){
		serviceSelectedCallback($(e.target).html());
	});
}

function fixService(preset){
	// if current service supports both languages - there is no need to change service
	var activeService = availableServices.where(function(s){return s.name == preset.service;})[0];
	if(activeService.isSourceLanguageSupported(preset.source) && activeService.isTargetLanguageSupported(preset.target)){
		return;
	}
	
	// if current service doesn't support both languages - we have to find first service that does.
	preset.service = availableServices
		.where(function(item){return item.isSourceLanguageSupported(preset.source) && item.isTargetLanguageSupported(preset.target); })	
		[0]
		.name;
}

function renderPreset(preset, target){
	var html = String.format(
		"<div id='{3}'>From <a href='#changeSource'>{0}</a> to <a href='#changeTarget'>{1}</a> with service <a href='#changeService'>{2}</a> [<a href='#removePreset'>remove</a>]</div>", 
		preset.source, 
		preset.target, 
		preset.service, 
		preset.id);
	$(target).append(html);
	
	var presetSelector = "#"+ preset.id;
	
	$(presetSelector + " a[href='#changeSource']").click(function(e){
		//forEachIn(e, function(key,value){document.write(key + " = "+value + "<BR/>");});
		e.stopPropagation();
		selectLanguage(
			{x: e.clientX, y: e.clientY}, 
			function(language){
				preset.source = language;
				fixService(preset);
				savePreferences(preferences);
			});
	});
	
	$(presetSelector + " a[href='#changeTarget']").click(function(e){
		e.stopPropagation();
		selectLanguage(
			{x: e.clientX, y: e.clientY}, 
			function(language){
				preset.target = language;
				fixService(preset);
				savePreferences(preferences);
			});
	});
	
	$(presetSelector + " a[href='#changeService']").click(function(e){
		e.stopPropagation();
		selectService(
			preset.source, 
			preset.target,
			{x: e.clientX, y: e.clientY}, 
			function(service){
				preset.service = service;
				savePreferences(preferences);
			});
	});	
	
	$(presetSelector + " a[href='#removePreset']").click(function(){
		preferences.presets.remove(preset);
		savePreferences(preferences);
	});	
}

function destroyChildren(node)
{
  while (node.firstChild)
      node.removeChild(node.firstChild);
}

function invalidatePresets(presets){
	var target = $("#presets");
	//target.html("");
	$("#presets a").unbind('click');
	destroyChildren(document.getElementById("presets"));//.innerHTML = '';
	presets.each(
		function(p){
			renderPreset(p, target);
		});
}

function removeNode(id){
	var node = document.getElementById(id);
	if(node){
		var parent = node.parentNode || document.documentElement ;
		parent.removeChild(node);
	}
	
}


$(document).ready(function(){
	loadPreferences();
		
	$("#create-preset").click(function(){
		var preset = {source:languages[0], target:languages[0], service:availableServices[0].name, id:createGuid()};
		fixService(preset);
		preferences.presets.push(preset);
		savePreferences(preferences);
	});

	$("#remove-all-presets").click(function(){
		chrome.storage.local.clear(function(){
			preferences.presets = [];
			savePreferences(preferences);
		});
	});
	
	$(document).click(function(){
		removeNode("languages");
		removeNode("services");
	});
});
