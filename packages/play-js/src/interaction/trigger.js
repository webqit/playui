
/**
 * @imports
 */
import getListeners from './getListeners.js';


/**
 * Fires an event on an object's listenerBase.
 *
 * @param array|object 			subject
 * @param string                type
 * @param object                data
 *
 * @return Event
 */
export default function(subject, type, data = {}) {
	var listeners;
	if (listeners = getListeners(subject, false)) {
		return listeners.fire({target:subject, type, data});
	}
};