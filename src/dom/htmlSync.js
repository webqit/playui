
/**
 * @imports
 */
import _isString from '@webqit/util/js/isString.js';
import _isUndefined from '@webqit/util/js/isUndefined.js';
import { getEls } from '../util.js';

/**
 * Sets or gets HTML content.
 *
 * @param string|HTMLElement	content
 *
 * @return void|string
 */
export default function(els, content = null) {
	const _els = getEls.call(this, els);
	if (arguments.length > 1) {
		_els.forEach(el => {
			if (_isString(content)) {
				el.innerHTML = content;
			} else {
				el.innerHTML = '';
				if (!_isUndefined(content)) {
					el.append(content);
				}
			}
		});
		return this;
	}
	return _els[0].innerHTML;  
};
