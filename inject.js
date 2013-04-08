javascript:(function(){
var head = document.getElementsByTagName('HEAD').item(0);
var script= document.createElement("script");
script.type = "text/javascript";
script.src="http://localhost:9990/bootstrap.js";
head.appendChild( script);
}());