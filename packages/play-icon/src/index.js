
/**
 * @imports
 */
import dfn from './dfn.js';

/**
 * @definitions
 */
export default function(window) {

	const { icon } = dfn(window);
	
	/**
	 * The [ul] elements
	 */
	window.customElements.define('play-icon', icon);
};
