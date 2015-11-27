function arrangeWindow(){
	$("#extension-translation").css('top', $(document).scrollTop()+1);
	$("#extension-translation").css('left', $(document).scrollLeft());    
}

function popupTranslation(title, translationKey) {
	chrome.storage.local.get(
		translationKey, 
		function(items) {
			var translation = items[translationKey];			
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

			//complementAttrubite("data-flash-url");
			//complementAttrubite("value");

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
		});
}