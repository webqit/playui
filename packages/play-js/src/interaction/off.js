
/**
 * @imports
 */
import _isFunction from '@webqit/util/js/isFunction.js';
import _isTypeObject from '@webqit/util/js/isTypeObject.js';
import _getType from '@webqit/util/js/getType.js';
import getListeners from './getListeners.js';

/**
 * Removes listeners from an subject's firebase.
 *
 * @param array|object				subject
 * @param string|array|function		filter
 * @param function					originalHandler
 * @param object					params
 *
 * @return void
 */
export default function(subject, filter, originalHandler = null, params = {}) {
	if (!subject || !_isTypeObject(subject)) {
		throw new Error('Object must be of type subject; "' + _getType(subject) + '" given!');
	}
	if (_isFunction(filter)) {
		params = arguments.length > 2 ? originalHandler : {};
		originalHandler = filter;
		filter = null;
	}
	if (originalHandler && !_isFunction(originalHandler)) {
		throw new Error('Handler must be a function; "' + _getType(originalHandler) + '" given!');
	}
	var listeners;
	if (listeners = getListeners(subject, false)) {
		return listeners.forget({filter, originalHandler, params,});
	}
}
