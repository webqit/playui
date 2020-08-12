
/**
 * @imports
 */
import Observer from '@web-native-js/observer';
import _isEmpty from '@web-native-js/commons/js/isEmpty.js';
import _each from '@web-native-js/commons/obj/each.js';
import Item from '../collection/Item.js';

/**
 * ---------------------------
 * The Input class
 * ---------------------------
 */
			
export default class extends Item {

	/**
	 * Constructs a new Input instance.
	 *
	 * @param object				props
	 *
	 * @return void
	 */
	constructor(props = {}) {
		super();
		_each(props, (key, value) => {
			Observer.set(this, key, value);
		});
		this.computeAttended();
		Observer.observe(this, 'value', delta => {
			Observer.set(this, ':dirty', true);
			Observer.set(this, ':reset', false);
		});
	}

	/**
	 * Initializes the instance from a DOM input element.
	 *
	 * @param HTMLElement	 	el
	 *
	 * @return e
	 */
	init(el) {
		this.el = el;
		el.addEventListener('input', this.handleInput.bind(this));
		el.addEventListener('change', this.handleChange.bind(this));
		el.addEventListener('invalid', this.handleInvalid.bind(this));
		el.addEventListener('focusin', this.handleFocusIn.bind(this));
		el.addEventListener('focusout', this.handleFocusOut.bind(this));
	}

	/**
	 * Sets the input's new value.
	 *
	 * @param string}number 	value
	 *
	 * @return e
	 */
	setValue(value) {
		return Observer.set(this, 'value', value, true/*returnEvent*/);
	}

	/**
	 * Handles the input's "input" event.
	 *
	 * @param Event e
	 *
	 * @return bool
	 */
	handleInput(e) {
		this.setValidity(e.target);
		return this.setValue(e.target.value);
	}

	/**
	 * Handles the input's "change" event.
	 *
	 * @param Event e
	 *
	 * @return bool
	 */
	handleChange(e) {
	}

	/**
	 * Handles the input's "focusin" event.
	 *
	 * @param Event e
	 *
	 * @return bool
	 */
	handleFocusIn(e) {
		Observer.set(this, ':attended', true);
	}

	/**
	 * Handles the input's "focusout" event.
	 *
	 * @param Event e
	 *
	 * @return bool
	 */
	handleFocusOut(e) {
		this.computeAttended();
	}

	/**
	 * Handles the input's "change" event.
	 *
	 * @param Event e
	 *
	 * @return bool
	 */
	handleInvalid(e) {
		this.setValidity(e.target);
	}

	/**
	 * Returns the input's validity state.
	 *
	 * @return bool
	 */
	checkValidity() {
		if (this.el) {
			this.setValidity(this.el);
		}
		return this.validity.valid;
	}

	/**
	 * Sets the input's validity state.
	 *
	 * @param HTMLElement	 	el
	 *
	 * @return bool
	 */
	setValidity(el) {
		Observer.set(this, {
			validity: el.validity,
			validationMessage: el.validationMessage,
			':valid': el.validity.valid,
			':invalid': !el.validity.valid,
		});
	}

	/**
	 * Returns the input's validity state.
	 *
	 * @return Event
	 */
	computeAttended() {
		return Observer.set(this, ':attended', !_isEmpty(this.value) || this.value === 0, true/*returnEvent*/);
	}

	/**
	 * Resets the input.
	 *
	 * @return e
	 */
	reset() {
		return Observer.set(this, ':reset', true);
	}
};