
/**
 * @imports
 */
import _isString from '@webqit/util/js/isString.js';
import _isArray from '@webqit/util/js/isArray.js';
import _isObject from '@webqit/util/js/isObject.js';
import _isUndefined from '@webqit/util/js/isUndefined.js';
import _objFrom from '@webqit/util/obj/from.js';
import _each from '@webqit/util/obj/each.js';

/**
 * Gets or sets custom data.
 *
 * @param DOMElement			el 
 * @param string|array|object	requestOrPayload
 * @param mixed|void			val
 *
 * @return mixed
 */
export default function(el, requestOrPayload, val = null) {
	if (!el['.firedom'].data) {
		Object.defineProperty(el, '.firedom', {value: {data: {},},});
	}
	var customDataset = el['.firedom'].data;
	if (arguments.length === 2) {
		if (_isString(requestOrPayload)) {
			return customDataset[requestOrPayload];
		}
		if (_isArray(requestOrPayload)) {
			var vals = {};
			requestOrPayload.forEach(key => {
				vals[key] = customDataset[key];
			});
			return vals;
		}
	}
	var payload = requestOrPayload;
	if (!_isObject(requestOrPayload)) {
		payload = _objFrom(requestOrPayload, val);
	}
	_each(payload, (key, val) => {
		if (_isUndefined(val)) {
			delete customDataset[key];
		} else {
			customDataset[key] = val;
		}
	});
	return el;
};