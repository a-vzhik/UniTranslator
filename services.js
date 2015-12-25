function ServiceRequest (word, sourceLanguage, targetLanguage, finalUri) {
	this.word = word;
	this.sourceLanguage = sourceLanguage; 
	this.targetLanguage = targetLanguage; 
	this.finalUri = finalUri;
}

ServiceRequest.prototype.execute = function (onCompleted) {
	var that = this;
	var request = new XMLHttpRequest();
	console.log(this.finalUri);
	request.open("GET", this.finalUri, true);
	request.onreadystatechange = function () {
		if (request.readyState == 4) {
			var response = new ServiceResponse(that, request.responseText);
			onCompleted(response);
		}
	};

	request.send();				
}

function ServiceResponse (serviceRequest, responseBody) {
	this.serviceRequest = serviceRequest; 
	this.responseBody = responseBody;
}

function Service (id, name, url, supportedLanguages, parse, normalize){
	this.id = id;
	this.name = name;
	this.url = url;
	this.supportedLanguages = supportedLanguages,
	this.parse = parse;
	this.normalize = normalize;
}

Service.prototype.areLanguagesSupported = function (sourceLanguage, targetLanguage) {
	return this.supportedLanguages
		.where(function(pair) { return sourceLanguage == pair[0] && targetLanguage == pair[1]; })
		.any();
};

Service.prototype.translate = function (word, source, target, callback) {
	var uri = String.format(this.url, word, this.normalize(source), this.normalize(target));
	var serviceRequest = new ServiceRequest(word, source, target, uri);
	var parse = this.parse;
	var complementAttribute = this.complementAttribute;
	
	serviceRequest.execute( function (response) {
		var card = parse(response); 

		var baseUrl = uri;
		var hostBegin = baseUrl.indexOf("://") + 3;
		var hostEnd = baseUrl.indexOf("/", hostBegin);
		if (hostEnd > -1) {
			baseUrl = baseUrl.substring(0, hostEnd);
		}

		complementAttribute(card, "href", baseUrl);
		complementAttribute(card, "src", baseUrl);

		callback(card.html(), uri);
	});
};

Service.prototype.complementAttribute = function (card, attributeName, base){
	var selector = String.format("[{0}]", attributeName);
	card.find(selector).attr(
		attributeName, 
		function (_, value) {
			if(value.indexOf("://") > -1) {
				return;
			}

			if(value[0] != '/') {
				value = "/" + value;
			}

			return base + value;		
		});
};

var abbyyService = new Service(
	1, 
	"Abbyy Lingvo", 
	"http://www.lingvo-online.ru/ru/Translate/{1}-{2}/{0}", 
	[
		["English", "Russian"], ["English", "French"], ["English", "Spanish"], ["English", "German"], ["English", "Italian"],
		["Russian", "English"], ["Russian", "French"], ["Russian", "German"],
		["French", "English"], 
		["Spanish", "English"],
		["German", "English"], 
		["Italian", "English"]
	],
	function (response) {
		return $(response.responseBody).find("div.js-section-data");
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
	[
		["English", "Russian"], ["English", "German"], ["English", "Estonian"],
		["German", "Russian"], ["German", "English"],
		["French", "Russian"],
		["Spanish", "Russian"],
		["Italian", "Russian"],
		["Dutch", "Russian"],
		["Estonian", "Russian"], ["Estonian", "English"],
		["Latvian", "Russian"],
		["Russian", "English"], ["Russian", "German"], ["Russian", "French"], ["Russian", "Spanish"], ["Russian", "Italian"], 
		["Russian", "Estonian"], ["Russian", "Dutch"], ["Russian", "Latvian"]
	], 
	function (response) {
		return $(response.responseBody).find("#translation~table:first");
	}, 
	function (language) {
		switch (language) {
			case "English": return "1"; 
			case "Russian": return "2";
			case "German" : return "3";
			case "French" : return "4";
			case "Spanish" : return "5";
			case "Italian" : return "23";
			case "Dutch" : return "24";
			case "Estonian" : return "26";
			case "Latvian" : return "27";
			default: throw String.format("Unsupported language: {0}", language);
		}
	});
	
var wordReferenceService = new Service(
	3, 
	"WordReference", 
	"http://www.wordreference.com/{1}{2}/{0}", 
	[
		["English", "Russian"], ["English", "French"], ["English", "German"], ["English", "Spanish"], 
		["English", "Greek"], ["English", "Italian"], ["English", "Swedish"], ["English", "Portugues"], 
		["English", "Polish"], ["English", "Romanian"], ["English", "Czech"], ["English", "Chinese"],
		["English", "Japanese"], ["English", "Korean"], ["English", "Arabic"], ["English", "Turkish"],  
		["Russian", "English"], 
		["French", "English"], 
		["German", "English"], 
		["Spanish", "English"], 
		["Greek", "English"], 
		["Italian", "English"], 
		["Swedish", "English"], 
		["Portugues", "English"], 
		["Romanian", "English"], 
		["Czech", "English"], 
		["Chinese", "English"], 
		["Japanese", "English"], 
		["Korean", "English"], 
		["Turkish", "English"]
	],
	function (response) {
		var doc = $(response.responseBody);
		var node = doc.find("#article");
		
		console.log("!" + node.html().replace(/\s/mig, "") + "!");
		if (doc.find("#article #FTintro").length > 0 
			|| node.html().replace(/\s/mig, "") == "") {
			node = doc.find("#articleWRD table:first");
		}
		
		node.find("br:first, .small1").replaceWith("");
		node.find("br:first").replaceWith("");
		node.find(".wrcopyright").replaceWith("");
		node.find(".FrWrd")
			.css("width", "30%");
		node.find("td").css("padding", "0px 5px");
		node.find(".FrEx, .ToEx").css("color", "#A8A8A8");			
			
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