function arrangeWindow(){
	$("#polyglot-extension-translation-frame").css('top', $(document).scrollTop()+1);

	var diff = $(window).width() - $("#polyglot-extension-translation-frame").width();
	$("#polyglot-extension-translation-frame").css("left", $(document).scrollLeft() + diff/2)
}

function popupTranslation(title, translationKey) {
	chrome.storage.local.get(
		translationKey, 
		function(items) {
			var translation = items[translationKey];			
			var closeIcon = chrome.extension.getURL("close.svg");

			$(document.body).prepend(
				$("<iframe>")
					.attr("id", "polyglot-extension-translation-frame")
					//.attr("src", chrome.extension.getURL("popup.html"))
					.attr("frameborder", 0)
					.css("position", "absolute")
					.css("border", "0px")
					.css("display", "none")
					.css("float", "right")
					.css("padding", "0px")
					.css("z-index", "2147483647"));

			$("#polyglot-extension-translation-frame").ready(function () {
				//return;
				var frameContents = $("#polyglot-extension-translation-frame").contents();
				
				frameContents.find("body")
					.css("margin", "0px")
					.css("padding", "0px");
					
				frameContents.find("body").append(
						$(
						"<div id='extension-translation' style='color:black; font-family:Verdana; text-align:justify;  background:white; font-size:10pt; background:#fff; width:600px;-webkit-box-shadow: 3px 3px 5px #666;border:#4EA6EA solid 1px'>" +
						"  <div id='poliglot-extension-menu' style='font-weight:bold; height:30px; background:#4EA6EA; color:white; line-height:30px;vertical-align:middle'>" +
						"    <div id='extension-translation-close-button' style='cursor:pointer; float:right; margin:7px 10px;'>" +
						"       <img style='height:16px; width:16px;' src='" + closeIcon + "'/>" +
						"    </div>" +
						"    <span style='margin-left:10px'>" + title + "</span>" +
						"  </div>" +
						"  <div id='extension-translation-content' style='font-size:8pt;margin:10px;'></div>" +
						"</div>"));
						
	
				frameContents.find("#extension-translation-content").html(translation);
				frameContents.find("#extension-translation-close-button").click(function () {
					$("#polyglot-extension-translation-frame").fadeOut(
						'slow', 
						function () {
							$("#polyglot-extension-translation-frame").remove()
						});
				});
	
				//complementAttrubite("data-flash-url");
				//complementAttrubite("value");
	
				arrangeWindow();
	
				$(document).scroll(function () {
						arrangeWindow();
				});
	
				frameContents.find("#extension-translation-content p").css("margin", 0);
				frameContents.find("#extension-translation-content p").css("padding", 0);
				//frameContents.find("#extension-translation-content .p1").css("padding-left", 10);
				//frameContents.find("#extension-translation-content .p2").css("padding-left", 20);

				var translationContentDiv = frameContents.find("#extension-translation-content");
				var translationDiv = frameContents.find("#extension-translation");

				if (translationContentDiv.outerHeight() > $(window).height() / 2) {
					translationContentDiv.height(
						$(window).height() / 2);
					translationContentDiv.css('overflow-y', 'auto');
				}

				$("#polyglot-extension-translation-frame").width(
					translationDiv.outerWidth()+10);
				$("#polyglot-extension-translation-frame").height(
					translationDiv.outerHeight()+10);
	
				var diff = $(window).width() - $("#polyglot-extension-translation-frame").width();
				$("#polyglot-extension-translation-frame").css("left", diff/2)
	
				$("#polyglot-extension-translation-frame").fadeIn('fast');
/**/				
			});
		});
}