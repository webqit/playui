
/**
 * @imports
 */
import ruleCallback from './ruleCallback.js';
import TransformRule from './classes/TransformRule.js';
import vendorize from './vendorize.js';

/**
 * Returns computed CSS properties.
 *
 * @param HTMLElement		el
 * @param string|array		props
 * @param string			psuedo
 *
 * @return object|string
 */
export default function(el, props, psuedo = null) {
	var style = this.window.getComputedStyle(el, psuedo), rect;
	return ruleCallback.call(this, props, (prop, rawProp) => {
		var val = style.getPropertyValue(vendorize.call(this, prop) || prop);
		if ((prop === 'width' || prop === 'height') && val === '') {
			val = '0px';
		}
		// -----------------------------
		// We return an object for the "transform" property
		// -----------------------------
		if (prop === 'transform') {
			val = TransformRule.parse(this, val);
		}
		return val;
	}, false/*withVendorVersion*/);
};
