
/**
 * @imports
 */
import _isUndefined from '@webqit/util/js/isUndefined.js';

/**
 * Sets or gets text content.
 *
 * @param string 				content
 *
 * @return void|string
 */
export default function(el, content = null) {
	if (arguments.length > 1) {
		if (_isUndefined(content)) {
			content = '';
		}
		el.innerText = content;
		return el;
	}
	return el.innerText;  
};
