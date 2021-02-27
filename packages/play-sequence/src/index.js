
/**
 * @imports
 */
import dfn from './dfn.js';

/**
 * @definitions
 */
export default function(window) {

	const { ul, li, div } = dfn(window);
	
	window.customElements.define('play-seq-ul', ul, {extends: 'ul'});
	window.customElements.define('play-seq-li', li, {extends: 'li'});
	window.customElements.define('play-seq-div', div, {extends: 'div'});
};
