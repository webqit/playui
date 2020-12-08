
/**
 * @imports
 */
import _isUndefined from '@webqit/util/js/isUndefined.js';

/**
 * Appends new content.
 *
 * @param array 				...args
 *
 * @return HTMLElement
 */
export default function(el, ...args) {
	if (_isUndefined(args[0])) {
		args[0] = '';
	}
	el.prepend(...args); 
	return el; 
};
