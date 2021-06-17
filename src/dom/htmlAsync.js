
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
	let Reflow = getPlayUIGlobal.call(this, 'reflow');
	if (arguments.length > 1) {
		return Reflow.onwrite((resolve, reject) => {
			resolve(domHtml.call(this, ...arguments));
		}, true/*withPromise*/);
	}
	return Reflow.onread((resolve, reject) => {
		resolve(domHtml.call(this, ...arguments));
	}, true/*withPromise*/);
};
