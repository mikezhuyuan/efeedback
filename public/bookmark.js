javascript:(function(){
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src="http://localhost:9990/bootstrap.js";
	document.getElementsByTagName('head')[0].appendChild(script);
}());