
/**
 * @imports
 */
import { _isString, _isArray, _isObject } from '@webqit/util/js/index.js';
import { _each, _from as _objFrom } from '@webqit/util/obj/index.js';
import { _toCamel } from '@webqit/util/str/index.js';
import {
	_difference, _intersect, _exclude,
	_unique, _from as _arrFrom
} from '@webqit/util/arr/index.js';
import { getEls } from '../util.js';

/**
 * Gets an attribute or a list of attributes,
 * or sets an attribute or a list of attributes.
 *
 * @param Array|Element			els
 * @param string|array|object	requestOrPayload
 * @param string|bool|void		valOrMutation
 * @param bool|void				subValMutation
 *
 * @return mixed
 */
export default function(els, requestOrPayload, valOrMutation = null, subValMutation = null) {
	const _els = getEls.call(this, els);
	if (arguments.length === 2) {
		if (_isString(requestOrPayload)) {
			return _els[0].getAttribute(requestOrPayload);
		}
		if (_isArray(requestOrPayload)) {
			var vals = {};
			requestOrPayload.forEach(request => {
				vals[request] = _els[0].getAttribute(request);
			});
			return vals;
		}
	}
	var payload = requestOrPayload;
	if (_isObject(payload)) {
		subValMutation = valOrMutation;
	} else {
		payload = _objFrom(requestOrPayload, valOrMutation);
	}
	_els.forEach(el => {
		_each(payload, (name, valOrMutation) => {
			if (arguments.length > 3 || (_isObject(requestOrPayload) && arguments.length > 2)) {
				var currentVal = el.getAttribute(name);
				var currentValArray = currentVal ? currentVal.split(' ').map(val => val.trim()).filter(a => a) : [];
				// -----------------------
				// Add or remove
				// -----------------------
				var values = _arrFrom(valOrMutation).reduce((list, c) => list.concat(c.split(' ')), []).map(a => a.trim()).filter(a => a);
				if (!subValMutation && _intersect(currentValArray, values).length) {
					// Add...
					el.setAttribute(name, _exclude(currentValArray, ...values).join(' '));
				} else if (subValMutation && _difference(values, currentValArray).length) {
					// Remove...
					el.setAttribute(name, _unique(currentValArray.concat(values)).join(' '));
				}
			} else {
				if (valOrMutation === false) {
					el.removeAttribute(name);
				} else {
					el.setAttribute(name, valOrMutation === true ? 'true' : valOrMutation);
				}
			}
		});
	});
	return this;
};
