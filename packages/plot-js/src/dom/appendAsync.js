
/**
 * @imports
 */
import domAppend from './appendSync.js';

/**
 * The async type of domAppend().
 *
 * @see domAppend()
 *
 * @return Promise
 */
export default function(el, ...args) {
	return this.Reflow.onwrite((resolve, reject) => {
		try {
			resolve(domAppend.call(this, el, ...args));
		} catch(e) {
			reject(e);
		}
	}, true/*withPromise*/);
};
