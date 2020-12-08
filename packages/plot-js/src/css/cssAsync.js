
/**
 * @imports
 */
import _isString from '@webqit/util/js/isString.js';
import _isObject from '@webqit/util/js/isObject.js';
import cssReadAsync from './readAsync.js';
import cssWriteAsync from './writeAsync.js';

/**
 * The async type of css().
 *
 * @see css()
 *
 * @return Promise
 */
export default function(el, ...args) {
	if ((args.length > 1 && _isString(args[0])) || _isObject(args[0])) {
		return cssWriteAsync.call(this, el, ...args);
	}
	return cssReadAsync.call(this, el, ...args);
};
