
/**
 * @imports
 */
import dfn from './dfn.js';

/**
 * @definitions
 */
export default function(window) {

	const { ul, li } = dfn(window);
	
	/**
	 * The [ul] elements
	 */
	window.customElements.define('wn-collapsible-ul', ul, {extends: 'ul'});
    
    	
	/**
	 * The [li] elements
	 */
	window.customElements.define('wn-collapsible-li', li, {extends: 'li'});
};
