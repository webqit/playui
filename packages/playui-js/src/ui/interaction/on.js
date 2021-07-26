
/**
 * @imports
 */
import { _isFunction, _isTypeObject, _getType } from '@webqit/util/js/index.js';
import getListeners from './getListeners.js';
import { getEls } from '../../util.js';

/**
 * Adds a listener to an subject's firebase.
 *
 * @param array|Element				els
 * @param string|array|function		filter
 * @param function					handler
 * @param object					params
 *
 * @return Listener
 */
export default function(els, filter, handler, params = {}) {
	if (_isFunction(filter)) {
		params = arguments.length > 2 ? handler : {};
		handler = filter;
		filter = null;
	}
	if (!_isFunction(handler)) {
		throw new Error('Callback must be of type function; "' + _getType(handler) + '" given!');
	}
	var args = {filter, handler, params,};
	return getEls.call(this, els).reduce((_, el) => {
		if (!el || !_isTypeObject(el)) {
			throw new Error('Subject element must be of type Object; "' + _getType(el) + '" given!');
		}
		var listeners = getListeners(el);
		var existing;
		if (args.params.unique && (existing = listeners.filter(args)).length) {
			return existing[0];
		}
		return listeners.add(args);
	}, null);
};