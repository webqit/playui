
/**
 * @imports
 */
import { getPlayUIGlobal } from '../util.js';
import readSync from './readSync.js';

/**
 * The async type of readSync().
 *
 * @see readSync()
 *
 * @return Promise
 */
export default function(els, props, psuedo = null) {
	const Reflow = getPlayUIGlobal.call(this, 'Reflow');
	return Reflow.onread((resolve, reject) => {
		try {
			resolve(readSync.call(this, els, props, psuedo));
		} catch(e) {
			reject(e);
		}
	}, true/*withPromise*/);
};