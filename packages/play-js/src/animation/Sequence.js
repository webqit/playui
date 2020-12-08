
/**
 * @imports
 */
import Ani from './Ani.js';
import Timeline from './Timeline.js';
import _arrFrom from '@webqit/util/arr/from.js';
import _arrLast from '@webqit/util/arr/last.js';
import _merge from '@webqit/util/obj/merge.js';
import _isNumber from '@webqit/util/js/isNumber.js';
import _isEmpty from '@webqit/util/js/isEmpty.js';

/**
 * ---------------------------
 * A base class for Observer implementations.
 * ---------------------------
 */

export default class {
	
	/**
	 * Accepts elements (targets) and options for,
	 * and creates the, Observer instance.
	 *
	 * @param array     	entries
	 * @param object 		options
	 *
	 * @return void
	 */
	constructor(entries = [], params = {}) {
		this.$ = {};
        this.$.entries = [];
        this.$.params = params;
        this.nowPlaying = new Timeline;
        // -------------------
        entries.forEach(el => {
            this.add(el, params.timing);
        });
        this.queue = [];
	}
	
	/**
	 * Adda a new entry to the timeline.
	 * Optionally accepts a timing for the specific entry.
	 *
	 * @param HTMLElement 	    el
	 * @param pbject        	effect
	 * @param pbject 	        params
	 * @param function        	onfinish
	 * @param function        	oncancel
	 *
	 * @return void
	 */
	add(el, effect = {}, params = {}, onfinish = null, oncancel = null) {
        if (!this.$.entries.filter(entry => entry.el === el).length) {
            var entry = {el, effect, params, onfinish, oncancel};
            this.$.entries.push(entry);
            this.nowPlayingAdd(entry);
        }
    }	
	
	/**
	 * Removes an entry from the timeline.
	 *
	 * @param HTMLElement 	    el
	 *
	 * @return void
	 */
	remove(el) {
        this.$.entries = this.$.entries.filter(entry => entry.el !== el);
    }

	/**
	 * Adda a qualified entry to the nowPlaying.
	 *
	 * @param object 	     entry
	 *
	 * @return void
	 */
	nowPlayingAdd(entry) {
        if (!this.nowPlayingEffect) {
            return;
        }
        // ---------------------------------
        var createAnimation = (nowPlaying, entry, effect, params) => {
            var animation = new Ani(entry.el, effect, params);
            nowPlaying.add(animation);
            if (params.oneoff) {
                animation.onfinish(() => {
                    nowPlaying.remove(animation);
                    this.remove(entry.el);
                });
            }
            if (entry.onfinish) {
                animation.onfinish(entry.onfinish);
                
            }
            if (entry.oncancel) {
                animation.oncancel(entry.oncancel);
            }
        };
        // ---------------------------------
        var compute = (nowPlaying, queue) => {
            var entry = queue[0];
            var effect = !_isEmpty(entry.effect) ? entry.effect : this.nowPlayingEffect;
            var params = _merge({}, this.nowPlayingParams, entry.params);
            params.delay = (params.delay || 0);
            if (_isNumber(params.lag) || _isNumber(params.endLag)) {
                var lastAni = _arrLast(nowPlaying.$.animations);
                if (lastAni) {
                    lastAni.ready((anim, _params) => {
                        if (_isNumber(params.lag)) {
                            params.delay += _params.delay + params.lag;
                        } else {
                            params.delay += _params.delay + parseFloat(_params.endDelay) + _params.duration + params.endLag;
                        }
                        params.delay -= _isNumber(anim.currentTime) ? anim.currentTime : 0;
                        createAnimation(nowPlaying, entry, effect, params);
                        // ----------------
                        queue.shift();
                        if (queue.length) {
                            compute(nowPlaying, queue);
                        }
                    });
                    return;
                }
            }
            createAnimation(nowPlaying, entry, effect, params);
            // ----------------
            queue.shift();
            if (queue.length) {
                compute(nowPlaying, queue);
            }
        };
        this.queue.push(entry);
        if (this.queue.length === 1) {
            compute(this.nowPlaying, this.queue);
        }
	}
	
	/**
	 * Plays an effect.
	 *
	 * @param object|array  effect
	 * @param object		params
	 *
	 * @return Promise
	 */
	play(effect = {}, params = {}) {
        // Ongoing animation?
        // Clear only on subsequent call to this method
        if (this.nowPlayingEffect) {
            this.nowPlaying = new Timeline;
            this.queue = [];
       }
        this.nowPlayingEffect = effect;
        this.nowPlayingParams = params;
        // Create new playlist
        var entries = params.reverseList ? this.$.entries.slice().reverse() : this.$.entries;
        entries.forEach(entry => {
            if ((!params.except || !_arrFrom(params.except, false/*castObject*/).includes(entry.el))
            && (!params.only || _arrFrom(params.only, false/*castObject*/).includes(entry.el))) {
                this.nowPlayingAdd(entry);
            }
        });
        return this.nowPlaying.play();
    }

};
