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
	
    var xhr = new XMLHttpRequest();
    xhr.open("GET", uri, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var card = parse(xhr.responseText); 
			callback(card);
        }
    }

    xhr.send();	
};

var abbyyService = new Service(
	1, 
	"Abbyy Lingvo", 
	"http://lingvopro.abbyyonline.com/ru/Translate/{1}-{2}/{0}", 
	["English", "Russian", "French", "Spanish", "German", "Italian"],
	function(html){
		html = html.toLowerCase();

		var endToken = '</div>';
		var beginToken = '<div class="js-article-html">';

		var begin = html.indexOf(beginToken);
		var end = html.indexOf(endToken, begin);

		var card = html.substring(begin, end + endToken.length);

		begin = card.indexOf("<p");
		end = card.length;

		return card.substring(begin, end)
			.replace(/"/gim, "\\" + "\"")
			.replace(/'/gim, "\\" + "\'")
			.replace(/<noscript>/gim, "")
			.replace(/<\/noscript>/gim, "")
			.replace(/(\n|\r|\r\n)/gim, "");
	}, 
	function(language){
		switch(language){
			case "English": return "en"; 
			case "Russian": return "ru";
			case "German" : return "de";
			case "Italian" : return "it";
			case "Spanish" : return "es";
			case "French" : return "fr";
			default: throw "Unsupported language "+language;
		}
	});

var multitranService = new Service(
	2, 
	"Multitran", 
	"http://multitran.ru/c/m.exe?l1={1}&l2={2}&s={0}", 
	["English", "Russian"], 
	function(html){
		return "I can't parse Multitran response yet";
	}, 
	function(language){
		switch(language){
			case "English": return "1"; 
			case "Russian": return "2";
			default: throw "Unsupported language "+language;
		}
	});
	
var availableServices = [multitranService, abbyyService];

/*
var services = {
        "Multitran": {
            uri:"http://multitran.ru/c/m.exe?CL=1&s={0}&l1=1", 
			parse:function(html){
				alert("Service Unavailable!");
			}
        }, 
		"WordReference": {
			uri: "http://api.wordreference.com/0.8/"+wordReferenceApiKey+"/json/{1}{2}/{0}", 
			parse: function(html){
				alert(html);
			}
		},
        "Abbyy Lingvo" : {
            uri: "http://lingvopro.abbyyonline.com/ru/Translate/{1}-{2}/{0}",
			parse: function(html){
				html = html.toLowerCase();

				var endToken = '</div>';
				var beginToken = '<div class="js-article-html">';

				var begin = html.indexOf(beginToken);
				var end = html.indexOf(endToken, begin);

				var card = html.substring(begin, end + endToken.length);

				begin = card.indexOf("<p");
				end = card.length;

				return card.substring(begin, end)
					.replace(/"/gim, "\\" + "\"")
					.replace(/'/gim, "\\" + "\'")
					.replace(/<noscript>/gim, "")
					.replace(/<\/noscript>/gim, "")
					.replace(/(\n|\r|\r\n)/gim, "");
			}
        }
    };
*/