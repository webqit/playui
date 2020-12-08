
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
export default function(el, ...args) {
	return attrAsync.call(this, el, 'class', ...args);
};