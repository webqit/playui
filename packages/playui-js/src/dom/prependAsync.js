
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
	const Reflow = getPlayUIGlobal.call(this, 'reflow');
	return Reflow.onwrite((resolve, reject) => {
		resolve(domPrepend.call(this, els, ...args));
	}, true/*withPromise*/);
};
