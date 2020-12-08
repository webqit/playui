
/**
 * @imports
 */
import _isFunction from '@webqit/util/js/isFunction.js';
import readSync from './readSync.js';

/**
 * The async type of readSync().
 *
 * @see readSync()
 *
 * @return Promise
 */
export default function(el, props, psuedo = null) {
	return this.Reflow.onread((resolve, reject) => {
		try {
			resolve(_isFunction(props) ? props(el) : readSync.call(this, el, props, psuedo));
		} catch(e) {
			reject(e);
		}
	}, true/*withPromise*/);
};