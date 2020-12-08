
/**
 * @imports
 */
import _each from '@webqit/util/obj/each.js';
import _exclude from '@webqit/util/arr/exclude.js';
import _pushUnique from '@webqit/util/arr/pushUnique.js';
import _isString from '@webqit/util/js/isString.js';
import _isArray from '@webqit/util/js/isArray.js';
import _isObject from '@webqit/util/js/isObject.js';
import _isNumber from '@webqit/util/js/isNumber.js';
import _isNumeric from '@webqit/util/js/isNumeric.js';
import _isFunction from '@webqit/util/js/isFunction.js';
import _isEmpty from '@webqit/util/js/isEmpty.js';
import _isUndefined from '@webqit/util/js/isUndefined.js';
// ------------------------------------
import readSync from '@webqit/plot-js/src/css/readSync.js';
import writeSync from '@webqit/plot-js/src/css/writeSync.js';
import readRendering from '@webqit/plot-js/src/css/readRendering.js';
import readSyncKeyframes from '@webqit/plot-js/src/css/readKeyframes.js';
import cssVarRead from '@webqit/plot-js/src/css/varRead.js';
import cssAutopx from '@webqit/plot-js/src/css/autopx.js';
import TransformRule from '@webqit/plot-js/src/css/classes/TransformRule.js';

/**
 * ---------------------------
 * The Element utility class
 * ---------------------------
 */
			
export default class Ani {
	
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
		// Private properties
		this.el = el;
		this.$ = {
			readyCallbacks: [],
			finishCallbacks: [],
			cancelCallbacks: [],
			params: params,
		};
		// -----------------------------
		// Normalize params...
		// -----------------------------
		params.fill = params.fill || 'both';
		if (!('duration' in params)) {
			params.duration = 400;
		}
		// Convert certain easing strings to beizier curves
		if (params.easing && ['ease-in', 'ease-out', 'ease-in-out'].indexOf(params.easing) === -1 && params.easing.indexOf('(') === -1) {
			// Native easings, custom cubic-beziers, or Dramatic's cubic-beziers
			params.easing = cssVarRead.call(WQ.DOM, params.easing) || params.easing;
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
			// -----------------------------
			// The animation...
			// -----------------------------
			try {
				var anim = this.el.animate(keyframes, params);
			} catch(e) {
				this.$.error = e;
				return;
			}
			// Reverse
			if (params.reverse) {
				anim.reverse();
			}
			// A little polifyll
			if (!anim.effect) {
				anim.effect = {};
			}
			if (!anim.effect.duration) {
				anim.effect.duration = params.duration;
			}
			// -----------------------------
			// "onfinish" and "oncancel" listener
			// -----------------------------
			anim.onfinish = () => {
				// As getter, as it were
				if (params.cancelForCss) {
					anim.cancel();
					if (params.fill === 'forwards' || params.fill === 'both') {
						writeSync.call(WQ.DOM, this.el, lastFrame);
					}
				}
				this.$.finishCallbacks.forEach(callback => {
					callback(this.el);
				});
			};
			// oncancel listener
			anim.oncancel = () => {
				// As getter, as it were
				this.$.cancelCallbacks.forEach(callback => {
					callback(this.el);
				});
			};
			// -------------------
			this.$.anim = anim;
			this.$.firstFrame = firstFrame;
			this.$.lastFrame = lastFrame;
			this.$.params = params;
			if (this.$.readyCallbacks.length) {
				this.$.readyCallbacks.forEach(callback => callback(anim, params, firstFrame, lastFrame));
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
			});
		}
	}
		
	/**
	 * Returns the animation.
	 *
	 * @return Animation
	 */
	get anim() {
		return this.$.anim;
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
	 * Binds a function to the "onfinish" event.
	 *
	 * @param function callback
	 *
	 * @return this
	 *
	 */
	onfinish(callback) {
		if (!_isFunction(callback)) {
			throw new Error("Onfinish() accepts only a function.");
		}
		this.$.finishCallbacks.push(callback);
		return this;
	}
	
	/**
	 * Binds a function to the "oncancel" event.
	 *
	 * @param function callback
	 *
	 * @return this
	 *
	 */
	oncancel(callback) {
		if (!_isFunction(callback)) {
			throw new Error("Oncancel() accepts only a function.");
		}
		this.$.cancelCallbacks.push(callback);
		return this;
	}
	
	/**
	 * Returns the animation's progress.
	 *
	 * @return number
	 */
	progress() {
		if (this.$.anim) {
			return this.$.anim.currentTime / this.$.anim.effect.duration;
		}
		return 0;
	}
	
	/**
	 * Seeks the animation to a time.
	 *
	 * @param number to
	 *
	 * @return this
	 */
	seek(to) {
		if (!_isNumber(to)) {
			throw new Error("Seek() accepts only a numeric value.");
		}
		this.ready((anim, params) => {
			var totalDuration = params.duration + (params.delay || 0) + (params.endDelay || 0);
			anim.currentTime = Math.max(0, Math.min(to * totalDuration, totalDuration));
		});
		return this;
	}

	/**
	 * Reverses the animation.
	 *
	 * @return this
	 */
	reverse() {
		this.ready(anim => anim.reverse());
		return this;
	}
	
	/**
	 * Plays the animation.
	 * Returns an "onfinish" promise.
	 *
	 * @return Promise
	 */
	play() {
		return new Promise((resolve, reject) => {
			this.ready(anim => {
				anim.play();
				this.onfinish(() => resolve(this));
				this.oncancel(() => reject(this));
			}, reject);
		});
	}
	
	/**
	 * Pauses the animation.
	 *
	 * @return this
	 */
	pause() {
		this.ready(anim => anim.pause());
		return this;
	}
	
	/**
	 * Finishes the animation.
	 *
	 * @return this
	 */
	finish() {
		this.ready(anim => anim.finish());
		return this;
	}
	
	/**
	 * Cancels the animation.
	 *
	 * @return this
	 */
	cancel() {
		this.ready(anim => anim.cancel());
		return this;
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
	 *
	 * @return void
	 */
	static createCallback(el, effect, ready, error) {
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
					Ani.createCallback(el, [readSync.call(WQ.DOM, el, Object.keys(effect[0])), ...effect], ready, error);
				} else {
					Ani.createCallback(el, [readSync.call(WQ.DOM, el, Object.keys(effect)), effect], ready, error);
				}
			});
			return;
		}
		// -----------------------------
		// Create keyframes from CSS animation name...
		// -----------------------------
		if (_isString(effect)) {
			// Retrieve keyframes of the given animation name from css
			var animationName = effect;
			effect = readSyncKeyframes.call(WQ.DOM, animationName);
			if (!effect.length && error) {
				error('Animation name "' + animationName + '" not found in any stylesheet!');
			}
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