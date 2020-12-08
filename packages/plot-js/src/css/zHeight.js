
/**
 * @imports
 */
import _arrFrom from '@webqit/util/arr/from.js';
import readSync from './readSync.js';

/**
 * Returns the heighest z-index attained by any of its descendants,
 * starting from its stacking context.
 *
 * @param Element		el 
 *
 * @return int
 */
export default function(el) {
	var zIndex = 0;
	_arrFrom(el.children).forEach((el, i) => {
		zIndex = Math.max(zIndex, parseInt(readSync.call(this, el, 'z-index')) || 0);
	});
	return zIndex;
};
