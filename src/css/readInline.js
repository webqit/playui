
/**
 * @imports
 */
import ruleCallback from './ruleCallback.js';
import { getEls } from '../util.js';

/**
 * Returns inline-only CSS properties.
 *
 * @param Array|Element		els
 * @param string|object		prop
 * @param bool|string		withVendorVersions
 *
 * @return mixed
 */
export default function(els, props, withVendorVersion = 'auto') {
	const _els = getEls.call(this, els);
	var style = _els[0].getAttribute('style');
	if (props === 'all') {
		props = style.split(';').map(str => str.split(':')[0]);
	}
	return ruleCallback.call(this, props, prop => {
		var regex = new RegExp(';[ ]*?' + prop + ':([^;]+);?', 'g');
		return (regex.exec(';' + style) || ['', ''])[1].trim();
	}, withVendorVersion);
};
