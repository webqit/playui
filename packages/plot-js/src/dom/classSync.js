
/**
 * @imports
 */
import attrSync from './attrSync.js';

/**
 * A derivative of attrSync().
 *
 * @see attrSync()
 *
 * @return mixed
 */
export default function(el, ...args) {
	return attrSync.call(this, el, 'class', ...args);
};