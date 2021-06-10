
/**
 * @imports
 */
import _fromCamel from '@webqit/util/str/fromCamel.js';
import _toCamel from '@webqit/util/str/toCamel.js';
import { getPlayUIGlobal } from '../util.js';

/**
 * Returns the vendor-specific css property if supported. NULL if not.
 *
 * @param string 	prop
 *
 * @return string|NULL
 */
export default function(prop) {
	const window  = getPlayUIGlobal.call(this, 'window');
	const prefix = getPlayUIGlobal.call(this, 'prefix');
	var camelCasedProp = _toCamel(prop, true);
	if (prefix.api + camelCasedProp in window.document.body.style) {
		return prefix.css + _fromCamel(prop, '-');
	}
};
