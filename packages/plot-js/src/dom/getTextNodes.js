
/**
 * Returns all, only text nodes.
 *
 * @param Element 			el
 *
 * @return array
 */
export default function(el) {
	// Filter
	var rejectScriptTextFilter = {
		acceptNode: function(node) {
			if (node.parentNode.nodeName !== 'SCRIPT') {
				return this.window.NodeFilter.FILTER_ACCEPT;
			}
		}
	};
	// Walker
	var walker = this.window.document.createTreeWalker(el, this.window.NodeFilter.SHOW_TEXT, rejectScriptTextFilter, false);
	var node;
	var textNodes = [];
	while(node = walker.nextNode()) {
		textNodes.push(node.nodeValue);
	}
	return textNodes;
};
