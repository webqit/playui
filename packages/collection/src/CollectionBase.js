
/**
 * @imports
 */
import Observer from '@web-native-js/observer';
import _each from '@onephrase/util/obj/each.js';
import _remove from '@onephrase/util/arr/remove.js';
import _pushUnique from '@onephrase/util/arr/pushUnique.js';
import _unique from '@onephrase/util/arr/unique.js';
import _isArray from '@onephrase/util/js/isArray.js';
import _wrapped from '@onephrase/util/str/wrapped.js';
import _unwrap from '@onephrase/util/str/unwrap.js';

/**
 * ---------------------------
 * The List class
 * ---------------------------
 */
			
export default class {

	/**
	 * Constitutes the this context for subclasses.
	 * Adds items to the collection.
	 *
	 * @param object				items
	 * @param object				params
	 *
	 * @return void
	 */
	constructor(items = {}, params = {}) {
		this.params = params;
		if (!this.params.itemsOffset) {
			this.params.itemsOffset = 'entries';
		}
		this.fill(items);
		// Record sates
		Observer.set(this, 'current', {});
		_unique(params.takeStats || []).forEach(stateName => {
			var isMultiple;
			if (_wrapped(stateName, '[', ']')) {
				isMultiple = true;
				stateName = _unwrap(stateName, '[', ']');
				// Initialize the specific collation
				this.current[stateName] = [];
			}
			// Observe the sate
			var pathToState = this.params.itemsOffset + '..' + stateName;
			Observer.observe(this, pathToState, delta => {
				if (delta.value === true) {
					if (isMultiple) {
						// Add to a collection?
						_pushUnique(this.current[stateName], delta.originalSubject);
						Observer.set(this.current, stateName, this.current[stateName]);
					} else {
						Observer.set(this.current, stateName, delta.originalSubject);
					}
				} else if (delta.value === false) {
					if (isMultiple) {
						// Remove from a collection?
						_remove(this.current[stateName], delta.originalSubject);
						Observer.set(this.current, stateName, this.current[stateName]);
					} else if (this.current[stateName] === delta.originalSubject) {
						Observer.del(this.current, stateName);
					}
				}
			});
		});
	}

	/**
	 * Fills the collections with entries.
	 *
	 * @param object|array
	 *
	 * @return object
	 */
	fill(entries) {
		_each(entries, (key, value) => {
			Observer.set(this, key, value);
		});
	}

	/**
	 * Returns the list of items cast to array.
	 *
	 * @return array
	 */
	getItemsArray() {
		var items = this[this.params.itemsOffset];
		return _isArray(items) ? items : (items ? Object.values(items) : []);
	}

	/**
	 * Advances the list's selectedness to a item.
	 *
	 * @return object
	 */
	filter() {
	}

	/**
	 * Advances the list's selectedness to a item.
	 *
	 * @return object
	 */
	sort() {
	}
};