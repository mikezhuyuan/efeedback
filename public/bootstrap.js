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
		iframeUrl = 'http://cns-855:9990/service.html',
		selected,
		overlay,
		dialog, 
		tip,
		teacherTmpl,
		studentTmpl,
		tips = [],
		noop = function(){};
		window.tips = tips; //for debug

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
			    if (callback.call(elements[i], elements[i], i) === false) return elements;
			} else {
			  for (key in elements)
			    if (callback.call(elements[key], elements[key], key) === false) return elements;
			}

			return elements;
		},

		template: function(html) {
			return function(val){
				return $.dom(html.replace('{content}', val));
			};
		},

		message: function(method) {
		  var args = Array.prototype.slice.call(arguments, 1);
		  return JSON.stringify({method:method, args:args});
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
		if(overlay) {
			overlay.parentElement.removeChild(overlay);
			overlay = null;
		}
		
		var x = e.x + document.body.scrollLeft,
			y = e.y + document.body.scrollTop;		 
		
		if(selected) {
			var id = tips.length,
				tip = createTip(id, selected, x, y);
			tip.ask(function(text){
				postMessage('ask', id, text);
			});
			tips.push(tip);
			postMessage('startTalk', id, selected.innerText, location.href);
			selected = null;
		}

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
	
	function createTip(id, selected, x, y){
		var el = tip.cloneNode(true),
			dialog = createDialog(x, y + 42),
			overlay,
			defer,
			onask=noop;
		
		el.style.left = x + 'px';
		el.style.top = y + 'px';
		el.style.opacity = .6;

		el.onmouseover = function() {
			dialog.el.style.display = 'block';
			el.style.opacity = 1;
			overlay = addOverlay(selected);
			clearTimeout(defer);
		};
		
		el.onmouseout = function() {
			defer = setTimeout(function(){
				dialog.el.style.display = 'none';	
			}, 500);
						
			el.style.opacity = .9;
			overlay.parentElement.removeChild(overlay);
		}
		
		dialog.el.addEventListener('mouseover', function(){
			clearTimeout(defer);
		});

		dialog.ask(function(text){
			el.style.backgroundImage = 'url(http://cns-855:9990/coffee.png)';
			onask(text);
		});

		document.body.appendChild(el);

		draggable(el, dialog.el);

		return {
			el : el,
			answer : function(html){
				el.style.backgroundImage = 'url(http://cns-855:9990/mail.png)';
				dialog.answer(html);
			},
			ask : function(callback) {
				onask = callback;
			}
		};
	}
	
	function createDialog(x, y){
		var el = dialog.cloneNode(true),
			question = el.querySelector('.question'),
			ask = el.querySelector('.ask'),
			toolbar = el.querySelector('.toolbar'),
			defer,
			onask = noop;
		
		el.style.left = x + 'px';
		el.style.top = y + 'px';
		el.style.display = 'none';
		
		el.onmouseover = function() {
			clearTimeout(defer);
		};
		
		el.onmouseout = function() {
			defer = setTimeout(function(){
				el.style.display = 'none';	
			}, 500);			
		};
		
		function talk(node){
			toolbar.parentNode.insertBefore(node, toolbar.nextSibling);
		}

		function submit() {
			talk(studentTmpl(question.value));
			onask(question.value);
			question.value = '';
		}

		ask.onclick = function() {
			submit();	
		};
		
		question.onkeypress = function(e) {
			if (e.keyCode == '13'){
		      submit();
		      return false;
		    }
		};

		document.body.appendChild(el);
		
		return {
			el : el,
			answer : function(html) {
				talk(teacherTmpl(html));
			},
			ask : function(callback) {
				onask = callback;
			}
		};
	}
	
	function draggable(el){
		var x0, y0, 
			els = slice.call(arguments),
			pos;

		function down(e) {
			x0 = e.pageX, y0 = e.pageY;
			pos = [];
			$.each(els, function(e){
				pos.push({x:parseInt(e.style.left), y:parseInt(e.style.top)});
			});

			document.body.addEventListener('mousemove', move);
			document.body.style.webkitUserSelect = 'none';
		}

		function move(e) {
			var dx = e.pageX - x0, dy = e.pageY - y0;
			
			$.each(els, function(el, i){
				el.style.left = (pos[i].x + dx) + 'px';
				el.style.top = (pos[i].y + dy) + 'px';
			});
		}
		
		function up(e) {
			document.body.removeEventListener('mousemove', move);
			document.body.style.webkitUserSelect = '';
		}

		el.addEventListener('mousedown', down);
		el.addEventListener('mouseup', up);
	}

	function startSelect(){
		document.body.addEventListener('mousemove', move);
		document.body.addEventListener('click', select);			
	}; 

	window.__efrog_start_select__ = startSelect;

	var reciever = {
		init: function(dialogHTML, tipHTML, teacherHTML, studentHTML) {
			dialog = $.dom(dialogHTML);			
			tip = $.dom(tipHTML);			
			startSelect();
			teacherTmpl = $.template(teacherHTML);
			studentTmpl = $.template(studentHTML);
		},

		answer: function(id, html) {
			tips[id].answer(html);
		}
	};

	window.addEventListener("message", dispatch);

	function dispatch(e) {
		var data = JSON.parse(e.data);
		reciever[data.method].apply(null, data.args);
	}

	var iframe = $.dom('<iframe src="' + iframeUrl + '" name="efrog_service" style="top: -99999px; left: -99999px; position: absolute; width:1024px; height:1024px"></iframe>');

	document.body.appendChild(iframe);

	function postMessage(){
		var msg = $.message.apply(null, slice.call(arguments));
		iframe.contentWindow.postMessage(msg, '*');
	}
})();