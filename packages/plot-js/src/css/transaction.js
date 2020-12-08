
/**
 * @imports
 */
import cssReadInline from './readInline.js';
import cssWriteAsync from './writeAsync.js';
import Transaction from './classes/Transaction.js';

/**
 * Establishes a CSS operatiom that can be rolledback without altering similar operation by other code.
 *
 * @param HTMLElement			el 
 * @param string|array			props
 *
 * @return Transaction
 */
export default function(el, props) {
	return new Transaction(el, props, (el, props) => {
		return cssReadInline.call(this, el, props);
	}, (el, data) => {
		return cssWriteAsync.call(this, el, data);
	});
};
