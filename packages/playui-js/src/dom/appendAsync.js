
/**
 * @imports
 */
import { getPlayUIGlobal } from '../util.js';
import domAppend from './appendSync.js';

/**
 * The async type of domAppend().
 *
 * @see domAppend()
 *
 * @return Promise
 */
export default function(els, ...args) {
	const Reflow = getPlayUIGlobal.call(this, 'reflow');
	return Reflow.onwrite((resolve, reject) => {
		resolve(domAppend.call(this, els, ...args));
	}, true/*withPromise*/);
}
