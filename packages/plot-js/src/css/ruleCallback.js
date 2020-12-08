
/**
 * @imports
 */
import _arrFrom from '@webqit/util/arr/from.js';
import _fromCamel from '@webqit/util/str/fromCamel.js';
import _isArray from '@webqit/util/js/isArray.js';
import _each from '@webqit/util/obj/each.js';
import vendorize from './vendorize.js';

/**
 * Loops thru all keys in props calls callback to obtain their value.
 *
 * @param string|array		props
 * @param function			callback
 * @param bool				withVendorVersion
 *
 * @return NULL|bool
 */
export default function(props, callback, withVendorVersion) {
	var valsList = {};
	var propsList = _arrFrom(props);
	var callCallback = (i, prop) => {
		// We use the key as given, but we obtain value with
		// We support camel cases, but return their normalized versions
		var normalProp = _fromCamel(prop, '-').toLowerCase();
		// With vendor verison?
		// We set the vendor version first if support for this property
		if (withVendorVersion === 'auto') {
			valsList[normalProp] = callback(vendorize.call(this, normalProp) || normalProp, propsList[i]);
		} else {
			if (withVendorVersion) {
				var vendorizedProp = vendorize.call(this, normalProp);
				if (vendorizedProp) {
					valsList[vendorizedProp] = callback(vendorizedProp, propsList[i]);
				}
			}
			valsList[normalProp] = callback(normalProp, propsList[i]);
		}
	};
	_each(propsList, (i, prop) => {
		callCallback(i, prop);
	});
	return _isArray(props) || withVendorVersion || props === 'size' || props === 'offsets' 
		? valsList 
		: valsList[props];
};
