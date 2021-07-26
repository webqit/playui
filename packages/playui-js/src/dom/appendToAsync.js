
/**
 * @imports
 */
import { getPlayUIGlobal } from '../util.js';
import domAppendTo from './appendToSync.js';

/**
 * The async type of domAppendTo().
 *
 * @see domAppendTo()
 *
 * @return Promise
 */
export default function(els, ...args) {
	const Reflow = getPlayUIGlobal.call(this, 'reflow');
	return Reflow.onwrite((resolve, reject) => {
		resolve(domAppendTo.call(this, els, ...args));
	}, true/*withPromise*/);
}
