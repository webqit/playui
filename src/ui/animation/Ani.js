
/**
 * @imports
 */
import _each from '@webqit/util/obj/each.js';
import _exclude from '@webqit/util/arr/exclude.js';
import _pushUnique from '@webqit/util/arr/pushUnique.js';
import _last from '@webqit/util/arr/last.js';
import _isString from '@webqit/util/js/isString.js';
import _isArray from '@webqit/util/js/isArray.js';
import _isObject from '@webqit/util/js/isObject.js';
import _isNumeric from '@webqit/util/js/isNumeric.js';
import _isFunction from '@webqit/util/js/isFunction.js';
import _isEmpty from '@webqit/util/js/isEmpty.js';
import _isUndefined from '@webqit/util/js/isUndefined.js';
// ------------------------------------
import { readVar, readKeyframes } from '../../css/modules/global-css.js';
import transactCss from '../../css/transactCss.js';
import cssSync from '../../css/cssSync.js';
import CSSOM from '../../css/modules/CSSOM.js';
// ------------------------------------
import API from './API.js';

/**
 * ---------------------------
 * The Ani class
 * ---------------------------
 */

const cssAnimNameCache = {};
export default class Ani extends API {
	
	/**
	 * Creates an amiation from
	 * any of keyframes, CSS keyframe name, or CSS object.
	 *
	 * @param Element				el
	 * @param array|object|string	effect
	 * @param object				params
	 *
	 * @return this
	 */
	constructor(el, effect, params = {}) {
		super(el, effect, params);
		// -----------------------------
		this.$.params.fill = this.$.params.fill || 'forwards';
		if (!('duration' in this.$.params)) {
			this.$.params.duration = 400;
		}
		// Convert certain easing strings to beizier curves
		if (this.$.params.easing && ['ease-in', 'ease-out', 'ease-in-out'].indexOf(this.$.params.easing) === -1 && this.$.params.easing.indexOf('(') === -1) {
			// Native easings, custom cubic-beziers, or Dramatic's cubic-beziers
			this.$.params.easing = readVar.call(WebQit, this.$.params.easing) || this.$.params.easing;
		}
		// -----------------------------
		// Normalize keyframes...
		// -----------------------------
		const init = keyframes => {
			keyframes = keyframes.slice();
			// Mine out end-state properties
			var firstFrame = {};
			var lastFrame = {};
			keyframes = keyframes.map(keyframe => {
				keyframe = CSSOM.parseEach(keyframe).stringifyEach();
				// Marshal out its properties
				_exclude(Object.keys(keyframe), 'offset', 'easing').forEach(prop => {
					// Save last seen value of this property
					// across all keyframes...
					firstFrame[prop] = typeof firstFrame[prop] === 'undefined' ? keyframe[prop] : firstFrame[prop];
					lastFrame[prop] = keyframe[prop];
				});
				return keyframe;
			});
			// Try to get original
			var lastFramFill = _isArray(effect) ? _last(effect) : (
				_isObject(effect) ? effect : lastFrame
			);
			// -----------------------------
			// The animation...
			// -----------------------------
			try {
				var anim = this.el.animate(keyframes, this.$.params);
			} catch(e) {
				this.$.error = e;
				return;
			}
			// Reverse
			if (this.$.params.reverse) {
				anim.reverse();
			}
			// A little polifyll
			if (!anim.effect) {
				anim.effect = {};
			}
			if (!anim.effect.duration) {
				anim.effect.duration = this.$.params.duration;
			}
			// -----------------------------
			// "onfinish" and "oncancel" listener
			// -----------------------------
			anim.onfinish = () => {
				// As getter, as it were
				if (this.$.params.cancelForCss) {
					anim.cancel();
					if (this.$.params.fill === 'forwards' || this.$.params.fill === 'both') {
						cssSync.call(WebQit, this.el, lastFramFill);
					}
				}
				this.$.callFinish();
			};
			// oncancel listener
			anim.oncancel = () => this.$.callCancel();
			// -------------------
			this.$.anim = anim;
			this.$.firstFrame = firstFrame;
			this.$.lastFrame = lastFrame;
			if (this.$.readyCallbacks.length) {
				this.$.readyCallbacks.forEach(callback => callback(anim, this.$.params, firstFrame, lastFrame));
			}
			// -------------------
		};
		if (_isFunction(effect)) {
			effect(el, init);
		} else {
			Ani.createCallback(el, effect, init, error => {
				// -------------------
				this.$.error = error;
				// -------------------
			}, this.$.params.animNameNoCache);
		}
	}
	
	/**
	 * Animation-ready callback.
	 *
	 * @param function		succes
	 * @param function		error
	 *
	 * @return void
	 */
	ready(succes, error) {
		if (this.$.error) {
			if (error) {
				error(this.$.error);
			}
		} else if (this.$.anim) {
			succes(this.$.anim, this.$.params, this.$.firstFrame, this.$.lastFrame);
		} else {
			this.$.readyCallbacks.push(succes);
		}
	}
	
	/**
	 * Resolves the given effect into valid keyframes.
	 *
	 * Effect can be CSS animation name,
	 * or an object of CSS properties that represent the end keyframe.
	 *
	 * @param Element				el
	 * @param array|object|string	effect
	 * @param function				ready
	 * @param function				error
	 * @param bool					animNameNoCache
	 *
	 * @return void
	 */
	static createCallback(el, effect, ready, error, animNameNoCache) {
		// -----------------------------
		// Resolve firstFrame from current state?
		// -----------------------------
		var isObjectAndOnlyLastKeyframe = _isObject(effect) && !Object.values(effect).filter(v => _isArray(v)).length;
		var isArrayButEmptyFirstKeyframe = _isArray(effect) && effect.length > 1 && _isEmpty(effect[0]);
		if (isObjectAndOnlyLastKeyframe || isArrayButEmptyFirstKeyframe) {
			// Get first keyframe from current state
			WebQit.DOM.reflow.onread(() => {
				if (isArrayButEmptyFirstKeyframe) {
					effect.shift();
					Ani.createCallback(el, [cssSync.call(WebQit, el, Object.keys(effect[0])), ...effect], ready, error, animNameNoCache);
				} else {
					Ani.createCallback(el, [cssSync.call(WebQit, el, Object.keys(effect)), {...effect}/*clone*/], ready, error, animNameNoCache);
				}
			});
			return;
		}
		// -----------------------------
		// Create keyframes from CSS animation name...
		// -----------------------------
		if (_isString(effect)) {
			// Retrieve keyframes of the given animation name from css
			if (!cssAnimNameCache[effect] || !cssAnimNameCache[effect].length || animNameNoCache) {
				cssAnimNameCache[effect] = readKeyframes.call(WebQit, effect);
				if (!cssAnimNameCache[effect].length && error) {
					error('Animation name "' + effect + '" not found in any stylesheet!');
				}
			}
			effect = cssAnimNameCache[effect];
		}
		// -----------------------------
		// Resolve auto pixels...
		// -----------------------------
		if (_isArray(effect)) {
			var keyframesWithAutoSizes = [], css = {};
			_each(effect, (i, keyframe) => {
				// We can animate to auto width and height
				if (keyframe.height === 'auto') {
					css.height = 'auto';
					_pushUnique(keyframesWithAutoSizes, i);
				}
				if (keyframe.width === 'auto') {
					css.width = 'auto';
					_pushUnique(keyframesWithAutoSizes, i);
				}
			});
			if (keyframesWithAutoSizes.length) {
				// apply() will be called when ready
				// We return transactCss(), which in itself returns the return of apply()
				transactCss.call(WebQit, el, css, el => el.getBoundingClientRect()).then(result => {
					// Clone
					effect = effect.map(kf => ({...kf}));
					keyframesWithAutoSizes.forEach(i => {
						if (effect[i].width === 'auto') {
							effect[i].width = result.width + 'px';
						}
						if (effect[i].height === 'auto') {
							effect[i].height = result.height + 'px';
						}
					});
					ready(effect);
				});
				return;
			}
		}
		// -----------------------------
		// Return result...
		// -----------------------------
		// We return the return of success()
		ready(effect);
	}
};