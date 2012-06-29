var context = "selection";
var services = {
        "Multitran": {
            uri:"http://multitran.ru/c/m.exe?CL=1&s={0}&l1=1"
        }, 
        "Abbyy Lingvo" : {
            uri: "http://lingvopro.abbyyonline.com/ru/Translate/en-ru/{0}"
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
    $("#extension-translation").css('top', $(document).scrollTop());
    $("#extension-translation").css('left', $(document).scrollLeft());    
}

function popupTranslation(title, translation) {
    try {
		alert(translation);
		/*
        var closeIcon = chrome.extension.getURL("close.svg");
        $(document.body).append(
            "<div id='extension-translation' style='width:100%; padding:0px 10px; position:absolute;z-index:2147483647;'>" +
            "<center>" +
            "<div style='width:90%; color:black; font-family:Verdana; text-align:justify; font-weight:bold; font-size:10pt; background:#EEFFEE; border:gray 2px solid; '>" +
            "  <div id='poliglot-extension-menu' style='height:30px; background:#ccc;line-height:30px;vertical-align:middle'>" +
            "    <div id='extension-translation-close-button' style='cursor:pointer; float:right; margin:0px 10px;'>" +
            "       <img style='height:16px; width:16px;' src='" + closeIcon + "'/>" +
            "    </div>" +
            "    <span style='margin-left:10px'>" + title + "</span>" +
            "  </div>" +
            "  <div id='extension-translation-content' style='margin:10px'></div>" +
            "  <div id='extension-translation-invisible-host' style=''>weerweeew</div>" +
            "</div>" +
                //"<iframe style='width:90%;' src='" + chrome.extension.getURL("frame.html") + "'/>" +
            "</center>" +
            "</div>");

        //$("#extension-translation-content").html(translation);
        $("#extension-translation-close-button, #extension-translation").click(function () {
            $("#extension-translation").remove();
        });

        $("#extension-translation-invisible-host").html(translation);
        $("#extension-translation-content").html($("#extension-translation-invisible-host > .js-article-html").html());
        alert($("#extension-translation-invisible-host > .js-article-html").html());
        arrangeWindow();

        $(document).scroll(function () {
            arrangeWindow();
        });
		*/
    }
    catch (e) {
        console.log(e);
    }
}

function onClick(info, tab) {
    var uri = String.format(hash[info.menuItemId].uri, info.selectionText);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", uri, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var regex = /<body[^>]*>([\s\S]+)<\/body>/gim; /*/<span class="translation">([^,<;]+)<\/span>/gi;*/
            var matches = regex.exec(xhr.responseText);
            var results = new Array();
            while (matches != null) {
                if (matches[1].isWhitespace() == false) {
                    results.push(matches[1]);
                }
                matches = regex.exec(xhr.responseText);
            }

			var properties = {
				selection: info.selectionText, 
				from: "en", 
				to: "ru", 
				translationBody: results[0]
			};
			
            //            console.log(JSON.stringify(chrome));
            //            console.log(results.join("; "));
            //            $.get(chrome.extension.getURL("polyglot.css"), function (data) {
            //                var style = String.format("<style>{0}</style>", data);
            //                console.log(style);
            //                $(document.head).append(style);
            //            });
            //            //chrome.tabs.insertCSS(null, { file: "polyglot.css" });
            //alert(results.join("; "));
			var formatted = results.join("; ").replace(/"/gi, "'").replace(/\s+/gim, "").substr(0, 1000);
			//alert(formatted);
			var method = String.format('popupTranslation("{0} [{1}]","{2}")', info.selectionText, "en->ru", formatted);
            console.log(method);
			alert(method);
            chrome.tabs.executeScript(
                    null,
                    { code: method});

        }
    }

    xhr.send();
  }
 
  
