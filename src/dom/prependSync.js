
/**
 * @imports
 */
import _isUndefined from '@webqit/util/js/isUndefined.js';
import { getEls } from '../util.js';

/**
 * Appends new content.
 *
 * @param array 				...args
 *
 * @return this
 */
export default function(els, ...args) {
	if (_isUndefined(args[0])) {
		args[0] = '';
	}
	getEls.call(this, els).forEach(el => {
		el.prepend(...args); 
	});
	return this; 
};
