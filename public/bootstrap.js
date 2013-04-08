(function(){
	if(!(/chrome/i.test(navigator.userAgent))) {
		alert('Sorry, this is beta version can only support Chrome.');
		return;
	}
	
	if(window.__efrog_start_select__) {
		window.__efrog_start_select__();
		return;
	}
		
	var undefined,
		emptyArray = [], 
		slice = emptyArray.slice, 		
		iframeUrl = 'http://localhost:9990/service.html',
		selected,
		overlay,
		dialog, 
		tip;

	var $ = {
		dom : function(html) {
			var container = document.createElement('div');
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
	
	function addOverlay(el) {
	    var rect = el.getBoundingClientRect(),
        	overlay = document.createElement('div'),
        	scrollTop = document.body.scrollTop,
        	scrollLeft = document.body.scrollLeft;

        overlay.setAttribute('style', 'pointer-events:none;position:absolute;margin:0;padding:0;background-color:#b4c6d7;opacity:0.6;z-index:10000')
        overlay.style.top = (rect.top + scrollTop) - 10 + 'px';
        overlay.style.left = (rect.left + scrollLeft) - 10 + 'px';
        overlay.style.width = (rect.width + 20) + 'px';
        overlay.style.height = (rect.height + 20) + 'px';
        document.body.appendChild(overlay);
	    
	    return overlay;
	}
	
	function select(e){
		if(selected) {
			selected = null;
		}
		
		if(overlay) {
			overlay.parentElement.removeChild(overlay);
			overlay = null;
		}
		
		var x = e.x + document.body.scrollLeft,
			y = e.y + document.body.scrollTop;		 
		
		createTip(x, y);
		
		document.body.removeEventListener('click', select);
		document.body.removeEventListener('mousemove', move);
	}

	function move(e){
		var el = document.elementFromPoint(e.x, e.y);
		if(selected != el) {
			selected = el;
			
			if(overlay) {
				overlay.parentElement.removeChild(overlay);
			}
				
			overlay = addOverlay(selected);
		}
	}
	
	function createTip(x, y){
		var el = tip.cloneNode(true),
			dialog = createDialog(x, y + 42);
		
		el.style.left = x + 'px';
		el.style.top = y + 'px';		
		el.onmouseover = function() {
			dialog.style.display = 'block';
			console.log(1);
		};
		
		el.onmouseout = function() {
			dialog.style.display = 'none';			
			console.log(2);
		}
		
		document.body.appendChild(el);
	}
	
	function createDialog(x, y){
		var el = dialog.cloneNode(true);
		
		el.style.left = x + 'px';
		el.style.top = y + 'px';
		el.style.display = 'none';
		
		el.onmouseover = function() {
			el.style.display = 'block';
			console.log(1);
		};
		
		el.onmouseout = function() {
			el.style.display = 'none';			
			console.log(2);
		}
		
		document.body.appendChild(el);
		
		return el;
	}
	
	function startSelect(){
		document.body.addEventListener('mousemove', move);
		document.body.addEventListener('click', select);			
	};
	
	window.__efrog_start_select__ = startSelect;

	var reciever = {
		init: function(dialogHTML, tipHTML) {
			dialog = $.dom(dialogHTML);			
			tip = $.dom(tipHTML);			
			startSelect();
		}
	};

	window.addEventListener("message", dispatch);

	function dispatch(e) {
		var data = JSON.parse(e.data);
		reciever[data.method].apply(null, data.args);
	}

	var iframe = $.dom('<iframe src="' + iframeUrl + '" name="efrog_service" style="top: 99999px; left: 99999px; position: absolute; width:1024px; height:1024px"></iframe>');

	document.body.appendChild(iframe);
})();