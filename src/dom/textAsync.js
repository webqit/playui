
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
	const Reflow = getPlayUIGlobal.call(this, 'reflow');
	if (arguments.length > 1) {
		return Reflow.onwrite(resolve => {
			resolve(domText.call(this, ...arguments));
		}, true/*withPromise*/);
	}
	return Reflow.onread(resolve => {
		resolve(domText.call(this, ...arguments));
	}, true/*withPromise*/);
};
