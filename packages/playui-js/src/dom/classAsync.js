
/**
 * @imports
 */
import attrAsync from './attrAsync.js';

/**
 * A derivative of attrSync().
 *
 * @see attrAsync()
 *
 * @return Promise
 */
export default function(els, ...args) {
	return attrAsync.call(this, els, 'class', ...args);
};