function arrangeTranslationFrame () {
	var frame = $("#polyglot-extension-translation-frame"); 

	var diff = $(window).width() - frame.width();
	frame.css("left", $(document).scrollLeft() + diff/2)
	frame.css('top', $(document).scrollTop() + 10);
}

function setupTranslationFrame (title, translation, uri) {
	var frameContents = $("#polyglot-extension-translation-frame").contents();
	
	frameContents.find("body")
		.css("margin", "0px")
		.css("padding", "0px");
		
	frameContents.find("body").append(
		 $("<div>")
			.attr("id", "extension-translation")
			.attr("style", "color:black; font-family:Verdana; text-align:justify;  background:white; font-size:10pt; background:#fff; width:600px;-webkit-box-shadow: 3px 3px 5px #666;border:#4EA6EA solid 1px")
			.append($("<div>")
				.attr("id", "poliglot-extension-menu")
				.attr("style", "font-weight:bold; height:30px; background:#4EA6EA; color:white; line-height:30px;vertical-align:middle")
				.append($("<div>")
					.attr("id", "extension-translation-close-button")
					.attr("style", "cursor:pointer; float:right; margin:7px 10px 7px 0px;")
					.append($("<img>")
						.attr("style", "height:16px; width:16px;")
						.attr("src", chrome.extension.getURL("media/icons/close.svg"))))
				.append($("<div>")
					.attr("style", "cursor:pointer; float:right; margin:7px 10px;")
					.append($("<a>")
						.attr("href", uri)
						.attr("target", "_blank")
						.append($("<img>")
							.attr("style", "height:16px; width:16px;")
							.attr("src", chrome.extension.getURL("media/icons/external.svg")))))
				.append($("<span>")
					.attr("style", "margin-left:10px")
					.append(title)))
			.append($("<div>")
				.attr("id", "extension-translation-content")
				.attr("style", "font-size:8pt;margin:10px;")
				.append(translation)));

	frameContents.find("#extension-translation-close-button").click(function () {
		$("#polyglot-extension-translation-frame").fadeOut(
			'slow', 
			function () {
				$("#polyglot-extension-translation-frame").remove()
			});
	});

	frameContents.find("#extension-translation-content p")
		.css("margin", 0)
		.css("padding", 0);

	// By default TABLEs ignore font settings of parent nodes. 
	// Force them to follow parent's font settings. 
	frameContents.find("#extension-translation-content table")
		.css("font-size", "inherit")
		.css("font-family", "inherit");

	// If translation content is longer than half-height 
	// of the window - restrict it to half-height of the window. 	
	var contentDiv = frameContents.find("#extension-translation-content");
	if (contentDiv.outerHeight() > $(window).height() / 2) {
		contentDiv.height($(window).height() / 2);
		contentDiv.css('overflow-y', 'auto');
	}

	// #extension-translation block has shadows, so we add 10 pixels 
	// to ensure IFRAME enough space trying to avoid scrollbars .  
	var translationDiv = frameContents.find("#extension-translation");
	$("#polyglot-extension-translation-frame").width(
		translationDiv.outerWidth()+10);
	$("#polyglot-extension-translation-frame").height(
		translationDiv.outerHeight()+10);

	arrangeTranslationFrame();
	$(document).scroll(arrangeTranslationFrame);

	$("#polyglot-extension-translation-frame").fadeIn('fast');
} 

function showTranslation (title, translationKey, uri) {
	$("#polyglot-extension-translation-frame").remove();
	chrome.storage.local.get(
		translationKey, 
		function(items) {			
			$(document.body).prepend(
				$("<iframe>")
					.attr("id", "polyglot-extension-translation-frame")
					.attr("frameborder", 0)
					.css("position", "absolute")
					.css("border", "0px")
					.css("display", "none")
					.css("z-index", "2147483647"));

			var translation = items[translationKey];			
			$("#polyglot-extension-translation-frame").ready(function () {
				setupTranslationFrame(title, translation, uri);
			});
		});
}
