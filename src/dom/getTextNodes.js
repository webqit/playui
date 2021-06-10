
/**
 * @imports 
 */
import { getPlayUIGlobal, getEls } from '../util.js';

/**
 * Returns all, only text nodes.
 *
 * @param Array|Element 			els
 *
 * @return array
 */
export default function(els) {
	const window  = getPlayUIGlobal.call(this, 'window');
	// Filter
	var rejectScriptTextFilter = {
		acceptNode: function(node) {
			if (node.parentNode.nodeName !== 'SCRIPT') {
				return window.NodeFilter.FILTER_ACCEPT;
			}
		}
	};
	// Walker
	var textNodes = [];
	getEls.call(this, els).forEach(el => {
		var walker = window.document.createTreeWalker(el, window.NodeFilter.SHOW_TEXT, rejectScriptTextFilter, false);
		var node;
		while(node = walker.nextNode()) {
			textNodes.push(node.nodeValue);
		}
	});
	return textNodes;
};
