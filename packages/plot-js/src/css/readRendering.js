
/**
 * @imports
 */
import _isObject from '@webqit/util/js/isObject.js';
import cssReadInline from './readInline.js';
import cssReadSync from './readSync.js';
import cssWriteSync from './writeSync.js';
import cssReadAsync from './readAsync.js';
import cssWriteAsync from './writeAsync.js';

/**
 * Applies some CSS within a transaction, gets computed values for use before rolling back.
 * If a callback is provided, it synces the entire operation with Reflow's normal read/write cycles.
 *
 * @param HTMLElement		el 
 * @param string|object		nameOrProps
 * @param string|number		val
 * @param function			readCallback
 * @param bool				asyncMode
 *
 * @return Promise
 */
export default async function(el, nameOrProps, val = null, readCallback = null. asyncMode = false) {
	var propsToRead = _isObject(nameOrProps) ? Object.keys(nameOrProps) : nameOrProps;
	readCallback = _isObject(nameOrProps) ? val : readCallback;
	// -------------
	var inlineSavepoint = cssReadInline.call(this, el, propsToRead);
	await (asyncMode ? cssWriteAsync : cssWriteSync).call(this, el, nameOrProps, val);
	var rendering = (asyncMode ? cssReadAsync : cssReadSync).call(this, el, readCallback || propsToRead);
	// We return the rendering in a promise
	await (asyncMode ? cssWriteAsync : cssWriteSync).call(this, el, inlineSavepoint);
	return rendering;
};
