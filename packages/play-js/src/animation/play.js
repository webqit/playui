
/**
 * @imports
 */
import _isFunction from '@webqit/util/js/isFunction.js';
import Ani from './Ani.js';
import Ani2 from './Ani2.js';

/**
 * Creates and plays an amiation.
 * @see Ani
 *
 * @param Element|Any			params
 * @param array|object|string	effect
 * @param object				params
 *
 * @return Promise
 */
export default function play(el, effect, params = {}) {
	var _ani = _isFunction(effect) ? Ani2 : Ani;
	return (new _ani(el, effect, params)).play().then(() => el);
};