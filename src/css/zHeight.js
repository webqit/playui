
/**
 * @imports
 */
import _arrFrom from '@webqit/util/arr/from.js';
import readSync from './readSync.js';
import { getEls } from '../util.js';

/**
 * Returns the heighest z-index attained by any of its descendants,
 * starting from its stacking context.
 *
 * @param Array|Element		els
 *
 * @return int
 */
export default function(els) {
	var zIndex = 0;
	const _el = getEls.call(this, els)[0];
	_arrFrom(_el.children).forEach((el, i) => {
		zIndex = Math.max(zIndex, parseInt(readSync.call(this, _el, 'z-index')) || 0);
	});
	return zIndex;
};
