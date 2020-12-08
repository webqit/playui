
/**
 * @imports
 */
import domHtml from './htmlSync.js';

/**
 * The async type of domHtml().
 *
 * @see domHtml()
 *
 * @return Promise
 */
export default function(el, write = null) {
	if (arguments.length > 1) {
		return this.Reflow.onwrite((resolve, reject) => {
			try {
				resolve(domHtml.call(this, ...arguments));
			} catch(e) {
				reject(e);
			}
		}, true/*withPromise*/);
	}
	return this.Reflow.onread((resolve, reject) => {
		try {
			resolve(domHtml.call(this, ...arguments));
		} catch(e) {
			reject(e);
		}
	}, true/*withPromise*/);
};
