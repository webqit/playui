
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
import API from './API.js';
// ------------------------------------
import readSync from '../css/readSync.js';
import writeSync from '../css/writeSync.js';
import readRendering from '../css/readRendering.js';
import readSyncKeyframes from '../css/readKeyframes.js';
import cssVarRead from '../css/varRead.js';
import cssAutopx from '../css/autopx.js';
import TransformRule from '../css/classes/TransformRule.js';

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
			this.$.params.easing = cssVarRead.call(WQ.DOM, this.$.params.easing) || this.$.params.easing;
		}
		// -----------------------------
		// Normalize keyframes...
		// -----------------------------
		var destructables = {
			inset: ['top', 'right', 'bottom', 'left'],
			margin: ['top', 'right', 'bottom', 'left'],
			padding: ['top', 'right', 'bottom', 'left'],
		};
		const init = keyframes => {
			keyframes = keyframes.slice();
			// Mine out end-state properties
			var firstFrame = {};
			var lastFrame = {};
			_each(keyframes, (i, keyframe) => {
				// -----------------------------
				// We can destucture things like "inset"("left", "top", "right", "bottom"), etc
				// -----------------------------
				_each(destructables, (destructableProp, meaning) => {
					if (keyframe[destructableProp]) {
						if (_isObject(keyframe[destructableProp])) {
							keyframe[destructableProp] = meaning.map(key => keyframe[destructableProp][key]).filter(val => !_isUndefined(val));
						}
						if (_isArray(keyframe[destructableProp])) {
							keyframe[destructableProp] = keyframe[destructableProp].join(' ');
						}
					}
				});
				// -----------------------------
				// We accept an object for the "transform" property
				// -----------------------------
				if (keyframe.transform && _isObject(keyframe.transform) && !(keyframe.transform instanceof TransformRule)) {
					keyframe.transform = (new TransformRule(keyframe.transform)).toString();
				}
				// Marshal out its properties
				_exclude(Object.keys(keyframe), 'offset', 'easing').forEach(prop => {
					// Auto-px
					if (cssAutopx.includes(prop) && _isNumeric(keyframe[prop])) {
						keyframe[prop] += 'px';
					}
					// Save last seen value of this property
					// across all keyframes...
					firstFrame[prop] = typeof firstFrame[prop] === 'undefined' ? keyframe[prop] : firstFrame[prop];
					lastFrame[prop] = keyframe[prop];
				});
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
						writeSync.call(WQ.DOM, this.el, lastFramFill);
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
			WQ.DOM.Reflow.onread(() => {
				if (isArrayButEmptyFirstKeyframe) {
					effect.shift();
					Ani.createCallback(el, [readSync.call(WQ.DOM, el, Object.keys(effect[0])), ...effect], ready, error, animNameNoCache);
				} else {
					Ani.createCallback(el, [readSync.call(WQ.DOM, el, Object.keys(effect)), {...effect}/*clone*/], ready, error, animNameNoCache);
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
				cssAnimNameCache[effect] = readSyncKeyframes.call(WQ.DOM, effect);
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
			var keyframesWithAutoSizes = [];
			_each(effect, (i, keyframe) => {
				// We can animate to auto width and height
				if (keyframe.height === 'auto') {
					_pushUnique(keyframesWithAutoSizes, i);
				}
				if (keyframe.width === 'auto') {
					_pushUnique(keyframesWithAutoSizes, i);
				}
			});
			if (keyframesWithAutoSizes.length) {
				// apply() will be called when ready
				// We return readRendering(), which in itself returns the return of apply()
				readRendering.call(WQ.DOM, el, {width:'auto', height:'auto'}, el => el.getBoundingClientRect()).then(result => {
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