
/**
 * @imports
 */
import _isNumber from '@webqit/util/js/isNumber.js';
import _isFunction from '@webqit/util/js/isFunction.js';
/**
 * ---------------------------
 * The Element utility class
 * ---------------------------
 */
			
export default class AniAPI {
	
	/**
	 * Creates an amiation from
	 * any of keyframes, CSS keyframe name, or CSS object.
	 *
	 * @param Element				el
	 * @param any					effect
	 * @param object				params
	 *
	 * @return this
	 */
	constructor(el, effect, params = {}) {
		// Private properties
		this.el = el;
		this.$ = {
			el,
			readyCallbacks: [],
			finishCallbacks: [],
			cancelCallbacks: [],
			params: {...params},
			callFinish() {
				this.finishCallbacks.forEach(callback => {
					callback(this.el);
				});
			},
			callCancel() {
				this.cancelCallbacks.forEach(callback => {
					callback(this.el);
				});
			},
		};
		this.$.params.delay = _isNumber(this.$.params.delay) ? this.$.params.delay : 0;
		this.$.params.duration = _isNumber(this.$.params.duration) ? this.$.params.duration : 400;
		this.$.params.endDelay = _isNumber(this.$.params.endDelay) ? this.$.params.endDelay : 0;
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
};