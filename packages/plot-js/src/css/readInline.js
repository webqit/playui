
/**
 * @imports
 */
import ruleCallback from './ruleCallback.js';

/**
 * Returns inline-only CSS properties.
 *
 * @param HTMLElement		el
 * @param string|object		prop
 * @param bool|string		withVendorVersions
 *
 * @return mixed
 */
export default function(el, props, withVendorVersion = 'auto') {
	var style = el.getAttribute('style');
	if (props === 'all') {
		props = style.split(';').map(str => str.split(':')[0]);
	}
	return ruleCallback.call(this, props, prop => {
		var regex = new RegExp(';[ ]*?' + prop + ':([^;]+);?', 'g');
		return (regex.exec(';' + style) || ['', ''])[1].trim();
	}, withVendorVersion);
};
