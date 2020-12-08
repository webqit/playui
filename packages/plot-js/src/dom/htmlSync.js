
/**
 * @imports
 */
import _isString from '@webqit/util/js/isString.js';
import _isUndefined from '@webqit/util/js/isUndefined.js';

/**
 * Sets or gets HTML content.
 *
 * @param string|HTMLElement	content
 *
 * @return void|string
 */
export default function(el, content = null) {
	if (arguments.length > 1) {
		if (_isString(content)) {
			el.innerHTML = content;
		} else {
			el.innerHTML = '';
			if (!_isUndefined(content)) {
				el.append(content);
			}
		}
		return el;
	}
	return el.innerHTML;  
};
