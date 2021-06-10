
/**
 * @imports
 */
import _isFunction from '@webqit/util/js/isFunction.js';
import { getPlayUIGlobal } from '../util.js';
import writeSync from './writeSync.js';

/**
 * The async type of writeSync().
 *
 * @see cssWrite()
 *
 * @return Promise
 */
export default function(els, nameOrProps, val = null) {
	const Reflow  = getPlayUIGlobal.call(this, 'Reflow');
	return Reflow.onwrite((resolve, reject) => {
		try {
			resolve(_isFunction(nameOrProps) ? nameOrProps(els) : writeSync.call(this, els, nameOrProps, val));
		} catch(e) {
			reject(e);
		}
	}, true/*withPromise*/);
};
