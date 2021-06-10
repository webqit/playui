
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
	const Reflow = getPlayUIGlobal.call(this, 'Reflow');
	return Reflow.onwrite((resolve, reject) => {
		try {
			resolve(domAppend.call(this, els, ...args));
		} catch(e) {
			reject(e);
		}
	}, true/*withPromise*/);
};
