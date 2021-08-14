
/**
 * @imports
 */
import dfn from './dfn.js';

/**
 * @definitions
 */
export default function(window) {

	const { file } = dfn(window);
	
	window.customElements.define('playui-file-input', file, { extends: 'input' });
};
