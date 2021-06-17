
/**
 * @imports
 */
import _isFunction from '@webqit/util/js/isFunction.js';
import _isTypeObject from '@webqit/util/js/isTypeObject.js';
import _getType from '@webqit/util/js/getType.js';
import getListeners from './getListeners.js';
import { getEls } from '../../util.js';

/**
 * Removes listeners from an subject's firebase.
 *
 * @param array|Element				els
 * @param string|array|function		filter
 * @param function					originalHandler
 * @param object					params
 *
 * @return void
 */
export default function(els, filter, originalHandler = null, params = {}) {
	if (_isFunction(filter)) {
		params = arguments.length > 2 ? originalHandler : {};
		originalHandler = filter;
		filter = null;
	}
	if (originalHandler && !_isFunction(originalHandler)) {
		throw new Error('Handler must be of type function; "' + _getType(originalHandler) + '" given!');
	}
	return getEls.call(this, els).reduce((_, el) => {
		if (!el || !_isTypeObject(el)) {
			throw new Error('Subject element must be of type object; "' + _getType(el) + '" given!');
		}
		var listeners;
		if (listeners = getListeners(el, false)) {
			return listeners.forget({filter, originalHandler, params,});
		}
	}, null);
}
