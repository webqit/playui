
/**
 * @imports
 */
import _isFunction from '@webqit/util/js/isFunction.js';
import ruleCallback from './ruleCallback.js';
import TransformRule from './classes/TransformRule.js';
import { getPlayUIGlobal, getEls } from '../util.js';

/**
 * Returns computed CSS properties.
 *
 * @param Array|Element		els
 * @param string|array		props
 * @param string			psuedo
 * @param function			styleCallback
 *
 * @return object|string
 */
export default function(els, props, psuedo = null, styleCallback = null) {
	const window  = getPlayUIGlobal.call(this, 'window');
	const _el = getEls.call(this, els)[0];
	var style;
	if (_isFunction(styleCallback)) {
		style = styleCallback(_el, psuedo, window);
	} else {
		style = window.getComputedStyle(_el, psuedo);
	}
	return ruleCallback.call(this, props, (prop, rawProp) => {
		var val = style.getPropertyValue ? style.getPropertyValue(prop) : style[prop];
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
