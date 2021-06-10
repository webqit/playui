
/**
 * @imports
 */
import domText from './textSync.js';
import { getPlayUIGlobal } from '../util.js';

/**
 * The async type of domText().
 *
 * @see domText()
 *
 * @return Promise
 */
export default function(els, write = null) {
	const Reflow = getPlayUIGlobal.call(this, 'Reflow');
	if (arguments.length > 1) {
		return Reflow.onwrite((resolve, reject) => {
			try {
				resolve(domText.call(this, ...arguments));
			} catch(e) {
				reject(e);
			}
		}, true/*withPromise*/);
	}
	return Reflow.onread((resolve, reject) => {
		try {
			resolve(domText.call(this, ...arguments));
		} catch(e) {
			reject(e);
		}
	}, true/*withPromise*/);
};
