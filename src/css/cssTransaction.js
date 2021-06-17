
/**
 * @imports
 */
import Transaction from '../Transaction.js';
import inlineCss from './inlineCss.js';
import cssAsync from './cssAsync.js';
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
		return inlineCss.call(this, el, props);
	}, (el, data) => {
		return cssAsync.call(this, el, data);
	});
};
