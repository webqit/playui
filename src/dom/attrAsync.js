
/**
 * @imports
 */
import domAttr from './attrSync.js';
import { getPlayUIGlobal } from '../util.js';

/**
 * The async type of domAttr().
 *
 * @see domAttr()
 *
 * @return Promise
 */
export default function(els, requestOrPayload, valOrMutation = null, subValMutation = null) {
	const Reflow = getPlayUIGlobal.call(this, 'Reflow');
	if (arguments.length === 2) {
		return Reflow.onwrite((resolve, reject) => {
			try {
				resolve(domAttr.call(this, ...arguments));
			} catch(e) {
				reject(e);
			}
		}, true/*withPromise*/);
	}
	return Reflow.onread((resolve, reject) => {
		try {
			resolve(domAttr.call(this, ...arguments));
		} catch(e) {
			reject(e);
		}
	}, true/*withPromise*/);
};
