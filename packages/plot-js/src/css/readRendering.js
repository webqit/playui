
/**
 * @imports
 */
import _isObject from '@webqit/util/js/isObject.js';
import cssReadInline from './readInline.js';
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
 *
 * @return Promise
 */
export default function(el, nameOrProps, val = null, readCallback = null) {
	var propsToRead = _isObject(nameOrProps) ? Object.keys(nameOrProps) : nameOrProps;
	readCallback = _isObject(nameOrProps) ? val : readCallback;
	// -------------
	var inlineSavepoint = cssReadInline.call(this, el, propsToRead);
	return cssWriteAsync.call(this, el, nameOrProps, val).then(() => {
		return cssReadAsync.call(this, el, readCallback || propsToRead).then(rendering => {
			// We return the rendering in a promise
			return cssWriteAsync.call(this, el, inlineSavepoint).then(() => {
				return rendering;
			});
		});
	});
};
