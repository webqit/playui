
/**
 * @imports
 */
import _isString from '@webqit/util/js/isString.js';
import _isArray from '@webqit/util/js/isArray.js';
import _isObject from '@webqit/util/js/isObject.js';
import _isUndefined from '@webqit/util/js/isUndefined.js';
import _objFrom from '@webqit/util/obj/from.js';
import _each from '@webqit/util/obj/each.js';
import { getEls } from '../util.js';

/**
 * Gets or sets custom data.
 *
 * @param Array|Element			els
 * @param string|array|object	requestOrPayload
 * @param mixed|void			val
 *
 * @return mixed
 */
export default function(els, requestOrPayload, val = null) {
	const _els = getEls.call(this, els);
	if (!_els[0]['.firedom'].data) {
		Object.defineProperty(_els[0], '.firedom', {value: {data: {},},});
	}
	if (arguments.length === 2) {
		var customDataset = _els[0]['.firedom'].data;
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
	_els.forEach(el => {
		var customDataset = el['.firedom'].data;
		_each(payload, (key, val) => {
			if (_isUndefined(val)) {
				delete customDataset[key];
			} else {
				customDataset[key] = val;
			}
		});
	});
	return this;
};