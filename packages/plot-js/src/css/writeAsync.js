
/**
 * @imports
 */
import _isFunction from '@webqit/util/js/isFunction.js';
import writeSync from './writeSync.js';

/**
 * The async type of writeSync().
 *
 * @see cssWrite()
 *
 * @return Promise
 */
export default function(el, nameOrProps, val = null) {
	return this.Reflow.onwrite((resolve, reject) => {
		try {
			resolve(_isFunction(nameOrProps) ? nameOrProps(el) : writeSync.call(this, el, nameOrProps, val));
		} catch(e) {
			reject(e);
		}
	}, true/*withPromise*/);
};
