
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
	window.customElements.define('play-seq-ul', class extends ul {}, {extends: 'ul'});
	window.customElements.define('play-seq-li', class extends li {}, {extends: 'li'});
    	
	/**
	 * The [div][div] elements
	 */
	window.customElements.define('play-seq-uldiv', class extends ul {}, {extends: 'div'});
	window.customElements.define('play-seq-lidiv', class extends li {}, {extends: 'div'});
};
