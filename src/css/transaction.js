
/**
 * @imports
 */
import cssReadInline from './readInline.js';
import cssWriteAsync from './writeAsync.js';
import Transaction from './classes/Transaction.js';
import { getEls } from '../util.js';

/**
 * Establishes a CSS operatiom that can be rolledback without altering similar operation by other code.
 *
 * @param Array|Element			els
 * @param string|array			props
 *
 * @return Transaction
 */
export default function(els, props) {
	const _el = getEls.call(this, els);
	return new Transaction(_el[0], props, (el, props) => {
		return cssReadInline.call(this, el, props);
	}, (el, data) => {
		return cssWriteAsync.call(this, el, data);
	});
};
