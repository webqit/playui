
/**
 * @imports
 */
import { _intersect, _from as _arrFrom } from '@webqit/util/arr/index.js';
import { _isObject } from '@webqit/util/js/index.js';
import attrSync from './attrSync.js';

/**
 * A derivative of attrSync().
 *
 * @see attrSync()
 *
 * @return mixed
 */
export default function(els, ...args) {
	if (arguments.length === 2 && !_isObject(args[0])) {
		var imputClassList = _arrFrom(args[0]).reduce((list, c) => list.concat(c.split(' ')), []).map(a => a.trim()).filter(a => a);
		var classList = getEls.call(this, els)[0].getAttribute('class');
		return classList ? _intersect(classList.split(' ').map(a => a.trim()).filter(a => a), imputClassList).length === imputClassList.length : false;
	}
	return attrSync.call(this, els, 'class', ...args);
}