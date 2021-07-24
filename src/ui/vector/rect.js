
/**
 * @imports
 */
import { getEls } from '../../util.js';
import UIRect from './UIRect.js';

/**
 * Creates and plays an amiation.
 * @see Animation
 *
 * @param Array|Element|Any		els
 * @param object				params
 *
 * @return Rect
 */
export default function rect(els, params = {}) {
	var _el = getEls.call(this, els)[0];
	return UIRect.calculate(_el, {CNTXT: this, ...params});
}