
/**
 * @imports
 */
import Fireable from './Fireable.js';

/**
 * ---------------------------
 * The Listener class
 * ---------------------------
 */				
export default class extends Fireable {

	/**
	 * Calls the observer's handler function
	 * on matching with the event's fields.
	 *
	 * @param Event			 	evt
	 *
	 * @return void
	 */
	fire(evt) {
		if (this.filter === evt.type) {
			evt.response(this.handler.call(this.subject, evt));
		}
	}
};