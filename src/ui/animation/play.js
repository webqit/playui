
/**
 * @imports
 */
import _isFunction from '@webqit/util/js/isFunction.js';
import { getEls } from '../../util.js';
import Ani from './Ani.js';
import Ani2 from './Ani2.js';

/**
 * Creates and plays an amiation.
 * @see Ani
 *
 * @param Array|Element|Any		els
 * @param array|object|string	effect
 * @param object				params
 *
 * @return Promise
 */
export default function play(els, effect, params = {}) {
	var _Ani = _isFunction(effect) ? Ani2 : Ani;
	return Promise.all(getEls.call(this, els).map(el => (new _Ani(el, effect, params)).play().then(() => this)));
};