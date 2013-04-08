(function(){
	var undefined,
		emptyArray = [], 
		slice = emptyArray.slice, 
		container = document.createElement('div'),
		iframeUrl = 'http://localhost:9990/twitter.html';

	var $ = {
		dom : function(html) {
		    container.innerHTML = '' + html;
		    var dom = $.each(slice.call(container.childNodes), function(){
		    	container.removeChild(this);
		    });

			return dom.length === 1 ? dom[0] : dom;
		},

		each : function(elements, callback){
		    var i, key;
			if (elements.length != undefined) {
			  for (i = 0; i < elements.length; i++)
			    if (callback.call(elements[i], i, elements[i]) === false) return elements;
			} else {
			  for (key in elements)
			    if (callback.call(elements[key], key, elements[key]) === false) return elements;
			}

			return elements;
		}
	}

	var reciever = {
		init: function(html) {
			document.body.appendChild($.dom(html));
		}
	};

	window.addEventListener("message", dispatch);

	function dispatch(e) {
		var data = JSON.parse(e.data);
		reciever[data.method].apply(null, data.args);
	}

	var iframe = $.dom('<iframe id="twitter" src="' + iframeUrl + '" name="twitter" style="top: -99999px; left: -99999px; position: absolute; width:1024px; height:1024px"></iframe>');
	
	document.body.appendChild(iframe);
})();