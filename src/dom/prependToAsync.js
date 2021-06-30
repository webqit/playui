
/**
 * @imports
 */
import { getPlayUIGlobal } from '../util.js';
import domPrependTo from './prependToSync.js';

/**
 * The async type of domPrependTo().
 *
 * @see domPrependTo()
 *
 * @return Promise
 */
export default function(els, ...args) {
	const Reflow = getPlayUIGlobal.call(this, 'reflow');
	return Reflow.onwrite((resolve, reject) => {
		resolve(domPrependTo.call(this, els, ...args));
	}, true/*withPromise*/);
}
