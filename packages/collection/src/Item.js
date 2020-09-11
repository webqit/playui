
/**
 * @imports
 */
import Observer from '@web-native-js/observer';
import _each from '@onephrase/util/obj/each.js';

/**
 * ---------------------------
 * The Frame class
 * ---------------------------
 *
 * This class represents a given route and manages
 * its sub-route.
 */
			
export default class {

	/**
	 * Constructs a new Item.
	 *
	 * @param object				entries
	 * @param object				params
	 *
	 * @return void
	 */
	constructor(entries = {}) {
		_each(entries, (key, value) => {
			Observer.set(this, key, value);
		});
	}

	/**
	 * Controls the Frame's active state.
	 *
	 * @param bool				state
	 *
	 * @return Event
	 */
	setActiveState(state = true) {
		if (this.active !== state) {
			var e = Observer.set(this, !state ? 'deactivating' : 'activating', true, true/*returnEvent*/);
			if (e.promises) {
				e.promises.then(() => {
					Observer.set(this, !state ? {deactivating:false, active:false} : {activating:false, active:true}, true/*returnEvent*/);
				});
				return e;
			} else {
				return Observer.set(this, !state ? {deactivating:false, active:false} : {activating:false, active:true}, true/*returnEvent*/);
			}
		}
	}
};