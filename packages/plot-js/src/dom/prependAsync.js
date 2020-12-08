
/**
 * @imports
 */
import domPrepend from './prependSync.js';

/**
 * The async type of domPrepend().
 *
 * @see domAppend()
 *
 * @return Promise
 */
export default function(el, ...args) {
	return this.Reflow.onwrite((resolve, reject) => {
		try {
			resolve(domPrepend.call(this, el, ...args));
		} catch(e) {
			reject(e);
		}
	}, true/*withPromise*/);
};
