
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
	 * The [ul][li] elements
	 */
	window.customElements.define('play-seq-ul', ul, {extends: 'ul'});
	window.customElements.define('play-seq-li', li, {extends: 'li'});
};
