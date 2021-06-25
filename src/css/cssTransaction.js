
/**
 * @imports
 */
import Transaction from '../misc/classes/Transaction.js';
import { readInline } from './cssSync.js';
import cssAsync from './cssAsync.js';
import cssSync from './cssSync.js';
import { getEls } from '../util.js';

/**
 * Establishes a CSS operatiom that can be rolledback without altering similar operation by other code.
 *
 * @param Array|Element			els
 * @param string|array			props
 * @param bool					asyncWrites
 *
 * @return Transaction
 */
export default function(els, props, asyncWrites = false) {
	const _el = getEls.call(this, els);
	const cssModule = asyncWrites ? cssAsync : cssSync;
	return new Transaction(_el[0], props, (el, props) => {
		return readInline.call(this, el, props);
	}, (el, data) => {
		return cssModule.call(this, el, data);
	});
}
