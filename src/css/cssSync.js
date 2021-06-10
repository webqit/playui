
/**
 * @imports
 */
import _isString from '@webqit/util/js/isString.js';
import _isObject from '@webqit/util/js/isObject.js';
import readSync from './readSync.js';
import writeSync from './writeSync.js';

/**
 * The readSync() and writeSync() function in one signature.
 *
 * @param Array|Element		els
 * @param array				...args
 *
 * @return mixed
 */
export default function(els, ...args) {
	if ((args.length > 1 && _isString(args[0])) || _isObject(args[0])) {
		return writeSync.call(this, els, ...args);
	}
	return readSync.call(this, els, ...args);
};
