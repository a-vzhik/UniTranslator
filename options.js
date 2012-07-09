$(document).ready(function(){
	/*
	chrome.storage.local.get(
		'presets', 
		function(items){
			alert(items);
		});
		*/
	chrome.storage.local.clear();
	
	$("#create-preset").click(function(){
		var presets = new Array();
		
		presets.push({source:"en", target:"ru", service:"Multitran"});
		presets.push({source:"fr", target:"en", service:"WordReference"});
		
		alert(JSON.stringify({"presets":presets}));
		
		return;
		
		chrome.storage.local.set(
			"presets",
			function(){ 
				$("#presets").append("<div>From <a href=''>en</a> to <a href=''>to</a> with service <a href=''>Multitran</a></div>");
			});
	});	
});
