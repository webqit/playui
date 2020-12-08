
/**
 * @imports
 */
import domText from './textSync.js';

/**
 * The async type of domText().
 *
 * @see domText()
 *
 * @return Promise
 */
export default function(el, write = null) {
	if (arguments.length > 1) {
		return this.Reflow.onwrite((resolve, reject) => {
			try {
				resolve(domText.call(this, ...arguments));
			} catch(e) {
				reject(e);
			}
		}, true/*withPromise*/);
	}
	return this.Reflow.onread((resolve, reject) => {
		try {
			resolve(domText.call(this, ...arguments));
		} catch(e) {
			reject(e);
		}
	}, true/*withPromise*/);
};
