
/**
 * @imports
 */
import _isString from '@webqit/util/js/isString.js';
import _isArray from '@webqit/util/js/isArray.js';
import _isObject from '@webqit/util/js/isObject.js';
import _isUndefined from '@webqit/util/js/isUndefined.js';
import _objFrom from '@webqit/util/obj/from.js';
import _each from '@webqit/util/obj/each.js';
import _internals from '@webqit/util/js/internals.js';
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
	if (arguments.length === 1 || (
		arguments.length === 2 && (_isString(requestOrPayload) || _isArray(requestOrPayload))
	)) {
		const playUiStub = _internals(_els[0], 'play-ui', 'data');
		// ------------------
		// Retrieve single prop
		if (_isString(requestOrPayload)) {
			return playUiStub.get(requestOrPayload);
		}
		// ------------------
		// Retrieve all props
		if (arguments.length === 1) {
			requestOrPayload = playUiStub.keys();
		}
		// ------------------
		// Retrieve listed props
		if (_isArray(requestOrPayload)) {
			var vals = {};
			requestOrPayload.forEach(key => {
				vals[key] = playUiStub.get(key);
			});
			return vals;
		}
	}

	var payload = requestOrPayload;
	if (!_isObject(requestOrPayload)) {
		payload = _objFrom(requestOrPayload, val);
	}
	_els.forEach(el => {
		const playUiStub = _internals(el, 'play-ui', 'data');
		_each(payload, (key, val) => {
			// ------------------
			// Unset prop?
			if (_isUndefined(val)) {
				playUiStub.delete(key);
			}
			// ------------------
			// Set prop
			else {
				playUiStub.set(key, val);
			}
		});
	});

	return this;
}