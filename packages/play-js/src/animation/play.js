
/**
 * @imports
 */
import Ani from './Ani.js';

/**
 * Creates and plays an amiation.
 * @see Ani
 *
 * @param array|object|string	effect
 * @param object				params
 *
 * @return Promise
 */
export default function play(el, effect, params = {}) {
	if (!('cancelForCss' in params)) {
		params.cancelForCss = true;
	}
	return (new Ani(el, effect, params)).play().then(() => el);
};