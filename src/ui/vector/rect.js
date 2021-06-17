
/**
 * @imports
 */
import { getEls } from '../../util.js';
import Rect from './UIRect.js';

/**
 * Creates and plays an amiation.
 * @see Ani
 *
 * @param Array|Element|Any		els
 * @param object				params
 *
 * @return Rect
 */
export default function vector(els, params = {}) {
	var _el = getEls.call(this, els)[0];
	return Rect.calculate(_el, {CNTXT: this, ...params});
};