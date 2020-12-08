
/**
 * @imports
 */
import _isFunction from '@webqit/util/js/isFunction.js';
import _isTypeObject from '@webqit/util/js/isTypeObject.js';
import _getType from '@webqit/util/js/getType.js';
import getListeners from './getListeners.js';

/**
 * Adds a listener to an subject's firebase.
 *
 * @param array|object				subject
 * @param string|array|function		filter
 * @param function					handler
 * @param object					params
 *
 * @return Listener
 */
export default function(subject, filter, handler, params = {}) {
	if (!subject || !_isTypeObject(subject)) {
		throw new Error('Object must be of type subject; "' + _getType(handler) + '" given!');
	}
	if (_isFunction(filter)) {
		params = arguments.length > 2 ? handler : {};
		handler = filter;
		filter = null;
	}
	if (!_isFunction(handler)) {
		throw new Error('Callback must be a function; "' + _getType(handler) + '" given!');
	}
	var args = {filter, handler, params,};
	var listeners = getListeners(subject);
	var existing;
	if (args.params.unique && (existing = listeners.filter(args)).length) {
		return existing[0];
	}
	return listeners.add(args);
};