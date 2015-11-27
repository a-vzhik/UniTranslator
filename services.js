function Service(id, name, url, supportedLanguages, parse, normalize){
	this.id = id;
	this.name = name;
	this.url = url;
	this.supportedLanguages = supportedLanguages,
	this.parse = parse;
	this.normalize = normalize;
}

Service.prototype.isSourceLanguageSupported = function(language){
	return this.supportedLanguages.indexOf(language) >= 0;
};

Service.prototype.isTargetLanguageSupported = function(language){
	return this.supportedLanguages.indexOf(language) >= 0;
};

Service.prototype.translate = function(word, source, target, callback){
	var uri = String.format(this.url, word, this.normalize(source), this.normalize(target));
	var parse = this.parse;
	var complementAttribute = this.complementAttribute;
	
	var xhr = new XMLHttpRequest();
	console.log(uri);
	xhr.open("GET", uri, true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			var card = parse(xhr.responseText); 

			var baseUrl = uri;
			var hostBegin = baseUrl.indexOf("://") + 3;
			var hostEnd = baseUrl.indexOf("/", hostBegin);
			if (hostEnd > -1)
			{
				baseUrl = baseUrl.substring(0, hostEnd);
			}

			complementAttribute(card, "href", baseUrl);
			complementAttribute(card, "src", baseUrl);

			callback(card.html());
		}
	};

	xhr.send();	
};

Service.prototype.complementAttribute = function (card, attributeName, base){
	var selector = String.format("[{0}]", attributeName);
	card.find(selector).attr(
		attributeName, 
		function (_, value) {
			if(value.indexOf("://") > -1) {
				return;
			}

			if(value[0] != '/')
			{
				value = "/" + value;
			}

			return base + value;		
		});
};

var abbyyService = new Service(
	1, 
	"Abbyy Lingvo", 
	"http://www.lingvo-online.ru/ru/Translate/{1}-{2}/{0}", 
	["English", "Russian", "French", "Spanish", "German", "Italian"],
	function(html){
		return $(html).find("div.js-section-data");
	}, 
	function(language){
		switch(language){
			case "English": return "en"; 
			case "Russian": return "ru";
			case "German" : return "de";
			case "Italian" : return "it";
			case "Spanish" : return "es";
			case "French" : return "fr";
			default: throw String.format("Unsupported language: {0}", language);
		}
	});

var multitranService = new Service(
	2, 
	"Multitran", 
	"http://multitran.ru/c/m.exe?l1={1}&l2={2}&s={0}", 
	["English", "Russian"], 
	function(html){
		return $(html).find("#translation~table:first");
	}, 
	function(language){
		switch(language){
			case "English": return "1"; 
			case "Russian": return "2";
			default: throw String.format("Unsupported language: {0}", language);
		}
	});
	
var availableServices = [multitranService, abbyyService];