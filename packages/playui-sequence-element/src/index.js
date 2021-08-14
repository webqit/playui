
/**
 * @imports
 */
import dfn from './dfn.js';

/**
 * @definitions
 */
export default function(window) {

	const { ul, li, div } = dfn(window);
	
	window.customElements.define('playui-sequence-ul', ul, { extends: 'ul' });
	window.customElements.define('playui-sequence-li', li, { extends: 'li' });
	window.customElements.define('playui-sequence-div', div, { extends: 'div' });
};
