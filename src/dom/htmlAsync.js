
/**
 * @imports
 */
import domHtml from './htmlSync.js';
import { getPlayUIGlobal } from '../util.js';

/**
 * The async type of domHtml().
 *
 * @see domHtml()
 *
 * @return Promise
 */
export default function(els, write = null) {
	let Reflow = getPlayUIGlobal.call(this, 'Reflow');
	if (arguments.length > 1) {
		return Reflow.onwrite((resolve, reject) => {
			try {
				resolve(domHtml.call(this, ...arguments));
			} catch(e) {
				reject(e);
			}
		}, true/*withPromise*/);
	}
	return Reflow.onread((resolve, reject) => {
		try {
			resolve(domHtml.call(this, ...arguments));
		} catch(e) {
			reject(e);
		}
	}, true/*withPromise*/);
};
