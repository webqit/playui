
/**
 * @imports
 */
import Observer from '@web-native-js/observer';
import _each from '@onephrase/util/obj/each.js';
import _isFunction from '@onephrase/util/js/isFunction.js';
import _isClass from '@onephrase/util/js/isClass.js';
import GenericCollection from '../../collection/src/Collection.js';
import Input from './Input.js';

/**
 * ---------------------------
 * The Collection class
 * ---------------------------
 */
			
export default class Collection extends GenericCollection {

	/**
	 * Constructs a new Collection instance.
	 *
	 * @param object				props
	 *
	 * @return void
	 */
	constructor(props = {}) {
		if (props.fields) {
			props.fields = Collection.createFields(props.fields);
		}
		super(props, {
			itemsOffset: 'fields',
		});
		Observer.set(this, 'submission', {});
	}

	/**
	 * Controls the selectNext button to
	 * submit the form on reaching last entry.
	 *
	 * @param bool				loop
	 *
	 * @return void}Event
	 */
	selectNext(loop = false) {
		if (!this.current.active || this.current.active.checkValidity()) {
			return super.selectNext(remainder => {
				if (remainder === 1) {
					// The last field is what's currently active
					this.submit();
					return false;
				}
				return loop;
			});
		}
	}

	/**
	 * Reflects the form's validity state.
	 *
	 * @return void}Event
	 */
	reportValidity() {
		return this.getItemsArray().filter(field => !field.checkValidity()).length === 0;
	}

	/**
	 * Collates values from fields.
	 *
	 * @return object
	 */
	getValues() {
		var values = {};
		_each(this.fields, (name, field) => {
			values[name] = field instanceof Collection ? field.getValues() : field.value;
		});
		return values;
	}

	/**
	 * Submits the form.
	 *
	 * @return void}Event
	 */
	submit() {
		if (this.submission.status === 'started' || !this.reportValidity()) {
			return;
		}
		// -----------------
		// While submitting
		// Set a flag
		var evt = Observer.set(this.submission, 'status', 'started');
		// ---------------
		// Listeners may want to handle submission
		// in a special way.
		// We agree to synchronize a submission complete
		// flag with custom submit handlers.
		if (evt.defaultPrevented) {
			Observer.set(this.submission, 'status', 'completed');
			return evt;
		}
		if (evt.promises) {
			evt.promises.then(msgs => {
				Observer.set(this.submission, {status:'completed', success:msgs});
			}).catch(msgs => {
				Observer.set(this.submission, {status:'completed', error:msgs});
			});
			return evt;
		}
		// ---------------
		// Submit into the router
		// Being the default action
		var submission = {};
		var values = this.getValues();
		if (!this.method || this.method.toLowerCase() === 'get') {
			submission['searchmap'] = values;
		} else {
			submission[this.method.toLowerCase()] = values;
		}
		if (this.action) {
			submission.href = this.action;
		}
		evt = Observer.set(Registry.get('router'), submission);
		Observer.set(this.submission, 'status', 'completed');
		return evt;
	}

	/**
	 * Creates Frames from declarations.
	 *
	 * @param array			fieldsList
	 *
	 * @return Frameset
	 */
	static createFields(fieldsList) {
		var fields = {};
		_each(fieldsList, (name, fieldConstructor) => {
			var field = fieldConstructor instanceof Input ? fieldConstructor
				: (_isClass(fieldConstructor) ? new fieldConstructor 
					: (_isFunction(fieldConstructor) ? fieldConstructor(match) 
						: new Input(fieldConstructor || {})));
			Observer.set(fields, name, field);
		});
		return fields;
	}
};