(function(){
	function addClientRectsOverlay(elt) {
	    // Absolutely position a div over each client rect so that its border width
	    // is the same as the rectangle's width.
	    // Note: the overlays will be out of place if the user resizes or zooms.
	    var rect = elt.getClientBoundingRect();
        var tableRectDiv = document.createElement('div');
        tableRectDiv.style.pointerEvents = 'none';
        tableRectDiv.style.position = 'absolute';
        tableRectDiv.style.border = '1px solid red';
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
        tableRectDiv.style.margin = tableRectDiv.style.padding = '0';
        tableRectDiv.style.top = (rect.top + scrollTop) + 'px';
        tableRectDiv.style.left = (rect.left + scrollLeft) + 'px';
        // we want rect.width to be the border width, so content width is 2px less.
        tableRectDiv.style.width = (rect.width - 2) + 'px';
        tableRectDiv.style.height = (rect.height - 2) + 'px';
        document.body.appendChild(tableRectDiv);
	    
	    return tableRectDiv;
	}

	var current, currentBound;
	document.body.addEventListener('mousemove', function(e){
		var el = document.elementFromPoint(e.x, e.y);
		if(current != el) {
			current = el;
			if(currentBound)
				currentBound.parent.removeChild(currentBound);
			currentBound = addClientRectsOverlay(current);
		}
	});
})();