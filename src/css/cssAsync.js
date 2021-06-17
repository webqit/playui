
/**
 * @imports
 */
import _isString from '@webqit/util/js/isString.js';
import _isObject from '@webqit/util/js/isObject.js';
import { getPlayUIGlobal } from '../util.js';
import cssSync from './cssSync.js';

/**
 * The async type of css().
 *
 * @see css()
 *
 * @return Promise
 */
export default function(els, ...args) {
	const Reflow = getPlayUIGlobal.call(this, 'reflow');
	const reflowPhrase = (args.length > 1 && _isString(args[0])) || _isObject(args[0]) 
		? 'onwrite' 
		: 'onread';
	return Reflow[reflowPhrase]((resolve, reject) => {
		resolve(cssSync.call(this, els, ...args));
	}, true/*withPromise*/);
};
