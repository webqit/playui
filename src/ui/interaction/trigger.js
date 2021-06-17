
/**
 * @imports
 */
import getListeners from './getListeners.js';
import { getEls } from '../../util.js';

/**
 * Fires an event on an object's listenerBase.
 *
 * @param array|Element 		els
 * @param string                type
 * @param object                data
 *
 * @return Event
 */
export default function(els, type, data = {}) {
	return getEls.call(this, els).reduce((_, el) => {
		var listeners;
		if (listeners = getListeners(el, false)) {
			return listeners.fire({target: el, type, data});
		}
	}, null);
};