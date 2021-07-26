
/**
 * @imports
 */
import { _isArray, _isFunction } from '@webqit/util/js/index.js';
import { _remove, _from as _arrFrom } from '@webqit/util/arr/index.js';
import AnimationAPI from './AnimationAPI.js';

/**
 * -----------------------------
 * The timeline class
 * for working with multiple animations.
 * -----------------------------
 */
 
export default class {
	
	/**
	 * Creates an amiation from keyframes.
	 *
	 * @param array					animations
	 * @param object				params
	 *
	 * @return this
	 */
	constructor(animations = [], params = {}) {
		// Private properties
		this.$ = {
			animations: [],
			finishCallbacks: [],
			cancelCallbacks: [],
			params: params,
		};
		animations.forEach(anim => {
			this.add(anim);
		});
	}

	/**
	 * Adds an animation instance.
	 *
	 * @param AnimationAPI			 anim
	 *
	 * @return this
	 */
	add(anim) {
		if (!(anim instanceof AnimationAPI)) {
			throw new Error('Argument#1 must be an animation AnimationAPI instance!');
		}
		this.$.animations.push(anim);
		
		if (this.$.addCallback) {
			this.$.addCallback(anim);
		}
		switch(this.$.playState) {
			case 'paused':
				anim.pause();
			break;
			case 'cancelled':
				anim.cancel();
			break;
			case 'finished':
				anim.finish();
			break;
		}
		if (this.$.reversed) {
			anim.reverse();
		}
		return this;
	}
	
	/**
	 * Removes an animation instance.
	 *
	 * @param AnimationAPI			 anim
	 *
	 * @return this
	 */
	remove(anim) {
		if (!(anim instanceof AnimationAPI)) {
			throw new Error('Argument#1 must be an animation AnimationAPI instance!');
		}
		_remove(this.$.animations, anim);
		if (this.$.removeCallback) {
			this.$.removeCallback(anim);
		}
		return this;
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
	 * Returns the average of all animation's progress.
	 *
	 * @return number
	 */
	progress() {
		return this.$.animations.reduce((a, b) => a.progress() + b.progress(), 0) / this.$.animations.length;
	}
	
	/**
	 * Plays all animations.
	 * Returns an "onfinish" promise.
	 *
	 * @return Promise
	 */
	play() {
		this.$.playState = 'playing';
		return new Promise((res, rej) => {
			// ---------------------------------
			var alreadyResolved, alreadyRejected;
			var handleFinish = () => {
				if (!alreadyResolved) {
					alreadyResolved = true;
					this.$.finishCallbacks.forEach(callback => callback());
					res(this);
				}
			};
			var handleCancel = e => {
				if (!alreadyRejected) {
					alreadyRejected = true;
					this.$.cancelCallbacks.forEach(callback => callback());
					rej(e);
				}
			};
			// ---------------------------------
			var total = this.$.animations.length;
			this.$.animations.forEach(anim => {
				anim.play().then(() => {
					total --;
					if (!total > 0) {
						handleFinish();
					}
				}).catch(handleCancel);
			});
			this.$.addCallback = entry => {
				if (this.$.playState === 'playing') {
					total ++;
					entry.play().then(() => {
						total --;
						if (!total > 0) {
							handleFinish();
						}
					}).catch(handleCancel);
				}
			};
			this.$.removeCallback = entry => {
				total --;
			};
		});
	}
		
	/**
	 * Seeks all animations to a time.
	 *
	 * @param int 		to
	 * @param array		except
	 *
	 * @return this
	 */
	seek(to, except = []) {
		// The validity of the "to" input is handled by each anim...
        return this.each(anim => anim.seek(to), except);
	}

	/**
	 * Reverses all animations.
	 *
	 * @param array		except
	 *
	 * @return this
	 */
	reverse(except = []) {
		this.$.reversed = this.$.reversed ? false : true;
        return this.each(anim => anim.reverse(), except);
	}
	/**
	 * Pauses all animations.
	 *
	 * @param array		except
	 *
	 * @return this
	 */
	pause(except = []) {
		this.$.playState = 'paused';
        return this.each(anim => anim.pause(), except);
	}
	
	/**
	 * Finishes all animations.
	 *
	 * @param array		except
	 *
	 * @return void
	 *
	 * @return this
	 */
	finish(except = []) {
		this.$.playState = 'finished';
        return this.each(anim => anim.finish(), except);
	}
	    	
	/**
	 * Cancels all effects.
	 
	 * @param array		except
	 *
	 * @return this
	 */
	cancel(except = []) {
		this.$.playState = 'cancelled';
        return this.each(anim => anim.cancel(), except);
	}

	/**
	 * Clears all animations.
	 *
	 * @param array		except
	 *
	 * @return void
	 */
	clear(except = []) {
		this.$.animations = this.$.animations.filter(anim => {
			if (!except || !_arrFrom(except, false/*castObject*/).includes(anim.el)) {
                return false;
            }
		});
		return this;
	}

	/**
	 * Loops thru entries, selectively.
	 
	 * @param array		except
	 *
	 * @return void
	 */
	each(callback, except = []) {
        this.$.animations.forEach(anim => {
            if (!except || !_arrFrom(except, false/*castObject*/).includes(anim.el)) {
                callback(anim);
            }
        });
		return this;
    }
}