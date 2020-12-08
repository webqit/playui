
/**
 * @imports
 */
import _fromCamel from '@webqit/util/str/fromCamel.js';

/**
 * Returns preset easing functions from CSS variables.
 *
 * @param string 	name
 *
 * @return string|NULL
 */
export default function(name) {
	var name = !name.indexOf('-') ? _fromCamel(name, '-') : name;
	return this.window.getComputedStyle(this.window.document.body).getPropertyValue('--' + name);
};
