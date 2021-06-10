
/**
 * @imports
 */
import _each from '@webqit/util/obj/each.js';

/**
 * Helper method: stringifies an associative array into a CSS string.
 *
 * @param object	 	css
 *
 * @return string
 */
export default function(css) {
	var str = [];
	_each(css, (propName, value) => {
		str.push(propName + ': ' + value);
	});
	return str.join('; ');
};
