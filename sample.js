var wordReferenceApiKey = "00ecd";

var context = "selection";
var services = {
        "Multitran": {
            uri:"http://multitran.ru/c/m.exe?CL=1&s={0}&l1=1", 
			parse:function(html){
				alert("Service Unavailable!");
			}
        }, 
		"WordReference": {
			uri: "http://api.wordreference.com/0.8/"+wordReferenceApiKey+"/json/enfr/{0}", 
			parse: function(html){
				alert(html);
			}
		},
        "Abbyy Lingvo" : {
            uri: "http://lingvopro.abbyyonline.com/ru/Translate/en-ru/{0}",
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

var parentTitle = "Translate with";
var parent = chrome.contextMenus.create({ "title": parentTitle, "contexts": [context] });

var hash = {};
for (var key in services) {
    var id = chrome.contextMenus.create({ "title": key,
        "contexts": [context],
        "parentId": parent,
        "onclick": onClick
    });
    hash[id] = services[key];
}

function arrangeWindow(){
    $("#extension-translation").css('top', $(document).scrollTop()+1);
    $("#extension-translation").css('left', $(document).scrollLeft());    
}

/*
function parseResponse(html) {
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
*/

function popupTranslation(title, translation) {
    var closeIcon = chrome.extension.getURL("close.svg");

    $(document.body).append(
        "<div id='extension-translation' style='width:90%; padding:0px 10px; position:absolute;z-index:2147483647;display:none;'>" +
        "<center>" +
        "<div style='color:black; font-family:Verdana; text-align:justify; font-size:10pt; background:#fff; width:600px;-webkit-box-shadow: 3px 3px 5px #666;border:#4EA6EA solid 1px'>" +
        "  <div id='poliglot-extension-menu' style='font-weight:bold; height:30px; background:#4EA6EA; color:white; line-height:30px;vertical-align:middle'>" +
        "    <div id='extension-translation-close-button' style='cursor:pointer; float:right; margin:0px 10px;'>" +
        "       <img style='height:16px; width:16px;' src='" + closeIcon + "'/>" +
        "    </div>" +
        "    <span style='margin-left:10px'>" + title + "</span>" +
        "  </div>" +
        "  <div id='extension-translation-content' style='font-size:8pt;margin:10px;'></div>" +
        "</div>" +
            //"<iframe style='width:90%;' src='" + chrome.extension.getURL("frame.html") + "'/>" +
        "</center>" +
        "</div>");

    $("#extension-translation-content").html(translation);
    $("#extension-translation-close-button").click(function () {
        $("#extension-translation").fadeOut(
            'slow', 
            function () {
                $("#extension-translation").remove()
            });
    });

    function complementAttrubite(attributeName) {
        $("#extension-translation-content *[" + attributeName + "]").each(function (_, element) {
            var value = $(element).attr(attributeName);
            var base = "http://lingvopro.abbyyonline.com";
            if(value[0] != '/')
            {
                base = base + "/";
            }
            var complementedValue =  base + value;
            $(element).attr(attributeName, complementedValue);
        });
    }

    complementAttrubite("href");
    complementAttrubite("src");
    //complementAttrubite("data-flash-url");
    //complementAttrubite("value");

    console.log($("#extension-translation").html());

    arrangeWindow();

    $(document).scroll(function () {
        arrangeWindow();
    });

    $("#extension-translation-content p").css("margin", 0);
    $("#extension-translation-content p").css("padding", 0);
    $("#extension-translation-content .p1").css("padding-left", 10);
    $("#extension-translation-content .p2").css("padding-left", 20);

    $("#extension-translation").fadeIn('fast', function () {
        if ($("#extension-translation-content").height() > $(window).height() / 2) {
            $("#extension-translation-content").css('height', $(window).height() / 2);
            $("#extension-translation-content").css('overflow-y', 'auto');
        }
    });
}

function onClick(info, tab) {
	var descriptor = hash[info.menuItemId];
    var uri = String.format(descriptor.uri, info.selectionText);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", uri, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var card = descriptor.parse(xhr.responseText); //parseResponse(xhr.responseText);
            var codeToExecute = String.format('popupTranslation("{0} [{1}]","{2}")', info.selectionText, "en->ru", card);
            chrome.tabs.executeScript(
               null,
               { code: codeToExecute });
        }
    }

    xhr.send();
  }