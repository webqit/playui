
/**
 * @imports
 */
import _isString from '@webqit/util/js/isString.js';
import _isArray from '@webqit/util/js/isArray.js';
import _isObject from '@webqit/util/js/isObject.js';
import _isUndefined from '@webqit/util/js/isUndefined.js';
import _isNumeric from '@webqit/util/js/isNumeric.js';
import _objFrom from '@webqit/util/obj/from.js';
import _each from '@webqit/util/obj/each.js';
import TransformRule from './classes/TransformRule.js';
import ruleCallback from './ruleCallback.js';
import autopx from './autopx.js';

/**
 * Sets new CSS properties.
 *
 * @param HTMLElement		el
 * @param string|object		nameOrProps
 * @param string|number		val
 *
 * @return HTMLElement
 */
export default function(el, nameOrProps, val = null) {
	nameOrProps = _isString(nameOrProps)
		? _objFrom(nameOrProps, val)
		: nameOrProps;
	var destructables = {
		inset: ['top', 'right', 'bottom', 'left'],
		margin: ['top', 'right', 'bottom', 'left'],
		padding: ['top', 'right', 'bottom', 'left'],
	};
	ruleCallback.call(this, Object.keys(nameOrProps), (prop, rawProp) => {
		var val = nameOrProps[rawProp];
		// -----------------------------
		// We can destucture things like "inset"("left", "top", "right", "bottom"), etc
		// -----------------------------
		_each(destructables, (destructableProp, meaning) => {
			if (prop === destructableProp) {
				if (_isObject(val)) {
					val = meaning.map(key => val[key]).filter(val => !_isUndefined(val));
				}
				if (_isArray(val)) {
					val = val.join(' ');
				}
			}
		});
		// -----------------------------
		// We accept an object for the "transform" property
		// -----------------------------
		if (prop === 'transform' && _isObject(val) && !(val instanceof TransformRule)) {
			val = (new TransformRule(val)).toString();
		}
		el.style[prop] = autopx.includes(prop) && _isNumeric(val)
			? val + 'px'
			: val;
	}, 'auto'/*withVendorVersion*/);
	return el;
};
