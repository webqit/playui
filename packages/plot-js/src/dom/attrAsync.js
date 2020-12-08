
/**
 * @imports
 */
import domAttr from './attrSync.js';

/**
 * The async type of domAttr().
 *
 * @see domAttr()
 *
 * @return Promise
 */
export default function(el, requestOrPayload, valOrMutation = null, subValMutation = null) {
	if (arguments.length === 2) {
		return this.Reflow.onwrite((resolve, reject) => {
			try {
				resolve(domAttr.call(this, ...arguments));
			} catch(e) {
				reject(e);
			}
		}, true/*withPromise*/);
	}
	return this.Reflow.onread((resolve, reject) => {
		try {
			resolve(domAttr.call(this, ...arguments));
		} catch(e) {
			reject(e);
		}
	}, true/*withPromise*/);
};
