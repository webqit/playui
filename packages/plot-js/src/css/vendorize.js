
/**
 * @imports
 */
import _fromCamel from '@webqit/util/str/fromCamel.js';
import _toCamel from '@webqit/util/str/toCamel.js';

/**
 * Returns the vendor-specific css property if supported. NULL if not.
 *
 * @param string 	prop
 *
 * @return string|NULL
 */
export default function(prop) {
	var camelCasedProp = _toCamel(prop, true);
	if (this.prefix.api + camelCasedProp in this.window.document.body.style) {
		return this.prefix.css + _fromCamel(prop, '-');
	}
};
