
/**
 * @imports
 */
import domPrepend from './prependSync.js';
import { getPlayUIGlobal } from '../util.js';

/**
 * The async type of domPrepend().
 *
 * @see domAppend()
 *
 * @return Promise
 */
export default function(els, ...args) {
	const Reflow = getPlayUIGlobal.call(this, 'Reflow');
	return Reflow.onwrite((resolve, reject) => {
		try {
			resolve(domPrepend.call(this, els, ...args));
		} catch(e) {
			reject(e);
		}
	}, true/*withPromise*/);
};
