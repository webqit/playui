
/**
 * @imports
 */
import _objFrom from '@webqit/util/obj/from.js';

/**
 * ---------------------------
 * Custom events
 * ---------------------------
 *
 * @var object
 */				
const CustomEvents = {};

/**
 * Multitap events
 */
const Multitap = class {
	
	/**
	 * Binds all multitap events.
	 */
	setup(el, eventName, fireCallback, hammertime) {
		if (!WQ.DOM.window.Hammer) {
			throw new Error('The Hammerjs library is needed to use the ' + eventName + ' gesture.');
		}
		// --------------------------
		this.el = el;
		this.eventName = eventName;
		this.fireCallback = fireCallback;
		this.hammertime = hammertime;
		// --------------------------
		var allSetup = true;
		var recognizers = MultitapEvents.map((tapType, i) => {
			var recognizer = this.hammertime.get(tapType);
			if (!recognizer) {
				allSetup = false;
				recognizer = new ENV.window.Hammer.Tap({
					event: tapType,
					taps: MultitapEvents.length - i,
				});
				this.hammertime.add(recognizer);
			}
			return recognizer;
		});
		if (!allSetup) {
			// From left to right, recognizeWith all others ahead
			var recgzr, recgzrs = recognizers.slice();
			while((recgzr = recgzrs.shift()) && recgzrs.length) {
				recgzr.recognizeWith(recgzrs);
			}
			// From right to left, recognizeWith all others behind
			var recgzr2, recgzrs2 = recognizers.slice();
			while((recgzr2 = recgzrs2.pop()) && recgzrs2.length) {
				recgzr2.requireFailure(recgzrs2);
			}
		}
		this.hammertime.on(this.eventName, this.fireCallback);
	}
	
	/**
	 * Unbinds all multitap events.
	 */
	teardown() {
		this.hammertime.off(this.eventName);
	}
};

/**
 * Now additional taps is achieved by
 * simply prepending to this array.
 */
const MultitapEvents = ['tripletap', 'doubletap', 'singletap'];
// Add all to CustomEvents
MultitapEvents.forEach(event => {
	CustomEvents[event] = Multitap;
});

/**
 * @exports
 */
export {
	CustomEvents as default,
	Multitap
};