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
	
	var request = new XMLHttpRequest();
	console.log(uri);
	request.open("GET", uri, true);
	request.onreadystatechange = function () {
		if (request.readyState == 4) {
			var card = parse(request.responseText); 

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

	request.send();	
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
	function (html) {
		return $(html).find("div.js-section-data");
	}, 
	function (language) {
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
	function (html) {
		return $(html).find("#translation~table:first");
	}, 
	function (language) {
		switch (language) {
			case "English": return "1"; 
			case "Russian": return "2";
			default: throw String.format("Unsupported language: {0}", language);
		}
	});
	
var wordReferenceService = new Service(
	3, 
	"WordReference", 
	"http://www.wordreference.com/{1}{2}/{0}", 
	["English", "Russian", "French", "Spanish", "German", "Italian", "Swedish", "Portugues", "Polish", "Romanian", 
	 "Greek", "Czech", "Chinese", "Japanese", "Korean", "Arabic", "Turkish"], 
	function (html) {
		var node = $(html).find("#article");
		if (node.contents().length == 0) {
			node = $(html).find("#articleWRD table");
		}
		
		node.find("br:first, .small1").replaceWith("");
		node.find("br:first").replaceWith("");		
		return node;
	}, 
	function (language) {
		switch (language) {
			case "English": return "en"; 
			case "Russian": return "ru";
			case "French": return "fr";
			case "Spanish": return "es";
			case "German": return "de";
			case "Italian": return "it";
			case "Swedish": return "sv";
			case "Portugues": return "pt";
			case "Polish": return "pl";
			case "Romanian": return "ro";
			case "Greek": return "gr";
			case "Czech": return "cz";
			case "Chinese": return "zh";
			case "Japanese": return "ja";
			case "Korean": return "ko";
			case "Arabic": return "ar";
			case "Turkish": return "tr";
			
			default: throw String.format("Unsupported language: {0}", language);
		}
	}		
);
	
var availableServices = [multitranService, abbyyService, wordReferenceService];