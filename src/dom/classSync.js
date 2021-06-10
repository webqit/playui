
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
export default function(els, ...args) {
	return attrSync.call(this, els, 'class', ...args);
};