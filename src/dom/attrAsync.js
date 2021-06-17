
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
	const Reflow = getPlayUIGlobal.call(this, 'reflow');
	if (arguments.length === 2) {
		return Reflow.onwrite(resolve => {
			resolve(domAttr.call(this, ...arguments));
		}, true/*withPromise*/);
	}
	return Reflow.onread(resolve => {
		resolve(domAttr.call(this, ...arguments));
	}, true/*withPromise*/);
};
