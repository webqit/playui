
/**
 * @imports
 */
import {
	_intersect, _unique, _from as _arrFrom
} from '@webqit/util/arr/index.js';
import { _isString, _isArray, _isObject } from '@webqit/util/js/index.js';
import { _each, _from as _objFrom } from '@webqit/util/obj/index.js';
import { _toCamel } from '@webqit/util/str/index.js';
import { getEls } from '../util.js';

/**
 * Gets an attribute or a list of attributes,
 * or sets an attribute or a list of attributes.
 *
 * @param Array|Element			els
 * @param string|array|object	requestOrPayload
 * @param string|bool|void		valOrStateOrTokens
 * @param bool|void				tokensState
 *
 * @return mixed
 */
export default function(els, requestOrPayload, valOrStateOrTokens = null, tokensState = null) {
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
	var payload;
	if (_isObject(requestOrPayload)) {
		payload = requestOrPayload;
	} else if (arguments.length === 4) {
		payload = {[requestOrPayload]/* attr name */: {
			[_arrFrom(valOrStateOrTokens).reduce((list, c) => list.concat(c.split(' ')), []).join(' ')]/* tokens */: tokensState/* tokens state */
		}};
	} else {
		// arguments.length === 3
		payload = _arrFrom(requestOrPayload/* attr name(s) */).reduce((_payload, name) => (_payload[name] = valOrStateOrTokens, _payload), {});
	}
	_els.forEach(el => {
		_each(payload, (name, valOrStateOrTokens) => {
			if (_isObject(valOrStateOrTokens)) {
				// Tokens Config
				var currentVal = el.getAttribute(name);
				var currentValArray = currentVal ? currentVal.split(' ').map(val => val.trim()).filter(a => a) : [];
				// -----------------------
				// Add or remove
				// -----------------------
				var newValueArray = currentValArray;
				_each(valOrStateOrTokens, (tokens, state) => {
					tokens = tokens.split(' ').map(a => a.trim()).filter(a => a);
					if (!state) {
						newValueArray = newValueArray.filter(t => {
							for (let _t of tokens) {
								if (t === _t || (_t.endsWith('-') && t.startsWith(_t))) return false;
							}
							return true;
						});
					} else {
						newValueArray = _unique(newValueArray.concat(tokens));
					}
				});
				if (!(newValueArray.length === currentValArray.length === _intersect(newValueArray, currentValArray).length)) {
					el.setAttribute(name, newValueArray.join(' '));
				}
			} else if (valOrStateOrTokens === false) {
				// State: false
				el.removeAttribute(name);
			} else if (valOrStateOrTokens === true) {
				// State: true
				el.setAttribute(name, 'true');
			} else { 
				// Val
				el.setAttribute(name, valOrStateOrTokens);
			}
		});
	});
	return this;
};
