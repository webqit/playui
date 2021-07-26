
/**
 * @imports
 */
import { _isUndefined } from '@webqit/util/js/index.js';
import { getEls } from '../util.js';

/**
 * Sets or gets text content.
 *
 * @param string 				content
 *
 * @return void|string
 */
export default function(els, content = null) {
	const _els = getEls.call(this, els);
	if (arguments.length > 1) {
		if (_isUndefined(content)) {
			content = '';
		}
		_els.forEach(el => {
			el.innerText = content;
		})
		return this;
	}
	return _els[0].innerText;  
};
