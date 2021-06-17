
/**
 * @imports
 */
import _isArray from '@webqit/util/js/isArray.js';
import { vendorize } from './modules/global-css.js';
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
export default function(els, props) {
	const _els = getEls.call(this, els);
	var style = _els[0].getAttribute('style');
	if (props === 'all') {
		props = style.split(';').map(str => str.split(':')[0]);
	}
	var rulesObj = vendorize.call(this, props).reduce((_rulesObj, prop) => {
		var regex = new RegExp(';[ ]*?' + prop + ':([^;]+);?', 'g');
		_rulesObj[prop] = (regex.exec(';' + style) || ['', ''])[1].trim();
		return _rulesObj;
	}, {});
	return _isArray(props) ? rulesObj : rulesObj[props];
};
