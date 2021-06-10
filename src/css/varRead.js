
/**
 * @imports
 */
import _fromCamel from '@webqit/util/str/fromCamel.js';
import { getPlayUIGlobal } from '../util.js';

/**
 * Returns preset easing functions from CSS variables.
 *
 * @param string 	name
 *
 * @return string|NULL
 */
export default function(name) {
	const window  = getPlayUIGlobal.call(this, 'window');
	var name = !name.indexOf('-') ? _fromCamel(name, '-') : name;
	return window.getComputedStyle(window.document.body).getPropertyValue('--' + name);
};
