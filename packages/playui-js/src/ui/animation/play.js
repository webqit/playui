
/**
 * @imports
 */
import { _isFunction } from '@webqit/util/js/index.js';
import { getEls } from '../../util.js';
import Animation from './Animation.js';
import Animation2 from './Animation2.js';

/**
 * Creates and plays an amiation.
 * @see Animation
 *
 * @param Array|Element|Any		els
 * @param array|object|string	effect
 * @param object				params
 *
 * @return Promise
 */
export default function play(els, effect, params = {}) {
	var _Animation = _isFunction(effect) ? Animation2 : Animation;
	return Promise.all(getEls.call(this, els).map(el => (new _Animation(el, effect, params, this)).play().then(() => this)));
}