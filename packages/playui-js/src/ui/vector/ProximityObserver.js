
/**
 * @imports
 */
import { _remove } from '@webqit/util/arr/index.js';
import { _merge, _even } from '@webqit/util/obj/index.js';
import on from '../interaction/on.js';
import Proximity from './Proximity.js';
import UIRect from './UIRect.js';

/**
 * ---------------------------
 * The ProximityObserver.
 * ---------------------------
 */

export default class {
	
	/**
	 * Initializes an instance of ProximityObserver
	 * with a callback and an options object.
	 *
	 * @param function 	callback
	 * @param object	options
	 *
	 * @return void
	 */
	constructor(callback, options = {}) {
		this.$ = {};
		this.$.options = options;
		this.$.targetsObj = [];
		var onePendingCall;
		this.$.root = this.$.options.root || window;
		var takeRecords = (continiously, fulfilPendingCall) => {
			if (this.$.waiting) {
				onePendingCall = true;
				return;
			}
			this.$.waiting = true;
			Reflow.instance().onread(() => {
				if (this.$.disconnected || this.$.paused) {
					return;
				}
				var entries = [];
				if (this.$.targetsObj.length) {
					var rootUIRect = UIRect.of(this.$.root);
					var changeInRoot = !_even(this.$.previousRootUIRect, rootUIRect);
					this.$.targetsObj.forEach(tObj => {
						var itemUIRect = UIRect.of(tObj.el);
						var changeInItem = !_even(tObj.previousItemUIRect, itemUIRect);
						if (changeInRoot || changeInItem) {
							var currentProximity = Proximity.calculate(itemUIRect, rootUIRect, this.$.options.axis, tObj.previousProximity);
							if (!_even(currentProximity, tObj.previousProximity, true/*assertion*/, 1/*depth*/)) {
								entries.push(_merge({target:tObj.el}, currentProximity));
							}
							tObj.previousProximity = currentProximity;
						}
						tObj.previousItemUIRect = itemUIRect;
					});
					this.$.previousRootUIRect = rootUIRect;
				}
				if (entries.length) {
					var disposition = callback(entries, this);
					if (disposition instanceof Promise) {
						this.$.paused = true;
						disposition.then(() => {
							this.$.paused = false;
						});
						disposition.catch(() => {
							this.$.paused = false;
						});
					}
				}
				if (continiously) {
					// This "truthy" return value is needed for us to be
					// called again on next reflow.
					// And this.$.waiting will remain true, since we're in "auto-call" mode.
					return continiously;
				}
				// The caller can call us again.
				// Or let's see if we have a pedning call to fulfil.
				this.$.waiting = false;
				if (onePendingCall && fulfilPendingCall) {
					onePendingCall = false;
					takeRecords(false, fulfilPendingCall);
				}
			});
		};
		if (this.$.options.events) {
			on(this.$.root, this.$.options.events, () => {
				takeRecords(false/*continiously*/, this.$.options.fulfilPendingCall);
			});
		} else {
			takeRecords(true/*continiously*/);
		}
	}
	
	/**
	 * Adds an element to observe against the root element.
	 *
	 * @param HTMLElement el
	 *
	 * @return void
	 */
	observe(el) {
		if (!this.$.targetsObj.filter(tObj => tObj.el === el).length) {
			this.$.targetsObj.push({el:el});
		}
	}
	
	/**
	 * Stops observing an element.
	 *
	 * @param HTMLElement el
	 *
	 * @return void
	 */
	unobserve(el) {
		this.$.targetsObj = this.$.targetsObj.filter(tObj => tObj.el !== el);
	}
	
	/**
	 * Stops all observations.
	 *
	 * @return void
	 */
	disconnect() {
		this.$.disconnected = true;
	}
};
