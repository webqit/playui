
/**
 * @imports
 */
import Observer from '@web-native-js/observer';
import _isArray from '@web-native-js/commons/js/isArray.js';
import _isEmpty from '@web-native-js/commons/js/isEmpty.js';
import _isFunction from '@web-native-js/commons/js/isFunction.js';
import _isClass from '@web-native-js/commons/js/isClass.js';
import _arrFirst from '@web-native-js/commons/arr/first.js';
import _arrLast from '@web-native-js/commons/arr/last.js';
import _following from '@web-native-js/commons/arr/following.js';
import _preceding from '@web-native-js/commons/arr/preceding.js';
import _each from '@web-native-js/commons/obj/each.js';
import CollectionBase from './CollectionBase.js';
import Item from './Item.js';

/**
 * ---------------------------
 * The List class
 * ---------------------------
 */
			
export default class extends CollectionBase {

	/**
	 * Constructs a new List instance.
	 * Sub-views may also be listed.
	 *
	 * @param array|object			items
	 * @param object				params
	 *
	 * @return void
	 */
	constructor(items = {}, params = {}) {
		if (!params.takeStats) {
			params.takeStats = [];
		}
		if (!params.takeStats.includes('active')) {
			params.takeStats.push('active');
		}
		if (!params.takeStats.includes('activating')) {
			params.takeStats.push('activating');
		}
		if (!params.takeStats.includes('deactivating')) {
			params.takeStats.push('deactivating');
		}
		super({}, params);
		Observer.observe(this, this.params.itemsOffset + '..activating', delta => {
			if (delta.value) {
				this.getItemsArray().forEach(item => {
					if (item.active === true && !item.activating) {
						item.setActiveState(false);
					}
				});
			}
		});
		this.fill(items);
	}

	/**
	 * Advances the list's selectedness to the
	 * first item.
	 *
	 * @return void}Event
	 */
	selectStart() {
		var first, items = this.getItemsArray();
		if (!_isEmpty(items) && (first = _arrFirst(items))) {
			return first.setActiveState(true);
		}
	}

	/**
	 * Advances the list's selectedness to the
	 * last item.
	 *
	 * @return void}Event
	 */
	selectEnd() {
		var last, items = this.getItemsArray();
		if (!_isEmpty(items) && (last = _arrLast(items))) {
			return last.setActiveState(true);
		}
	}
	
	/**
	 * Advances the list's selectedness to the
	 * item preceding the current current.active.
	 * Selects the last item if loopable and no current.active.
	 *
	 * @param bool|function	loop
	 *
	 * @return void}Event
	 */
	selectPrev(loop = false) {
		var preceding, items = this.getItemsArray();
		if (_isEmpty(items)) {
			if (_isFunction(loop)) {
				loop();
			}
			return;
		}
		if (this.current.active) {
			preceding = _preceding(items, this.current.active, false/*length*/, loop);
		} else if (loop && (!_isFunction(loop) || loop(0))) {
			preceding = _arrLast(items);
		}
		if (preceding) {
			return preceding.setActiveState(true);
		}
	}

	/**
	 * Advances the list's selectedness to the
	 * item following the current current.active.
	 * Selects the first item if loopable and no current.active.
	 *
	 * @param bool|function	loop
	 *
	 * @return void}Event
	 */
	selectNext(loop = false) {
		var following, items = this.getItemsArray();
		if (_isEmpty(items)) {
			if (_isFunction(loop)) {
				loop();
			}
			return;
		}
		if (this.current.active) {
			following = _following(items, this.current.active, false/*length*/, loop);
		} else if (loop && (!_isFunction(loop) || loop(0))) {
			following = _arrFirst(items);
		}
		if (following) {
			return following.setActiveState(true);
		}
	}

	/**
	 * Advances the list's selectedness to a random item.
	 *
	 * @return void}Event
	 */
	selectRand() {
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
	
	/**
	 * Creates entries from declarations.
	 *
	 * @param object|array			entries
	 * @param object|function		entryClass
	 *
	 * @return object|array
	 */
	static createEntries(entries, entryClass = Item) {
		var _entries = _isArray(entries) ? [] : {};
		_each(entries, (name, entry) => {
			entry = entry instanceof entryClass ? entry
				: (_isClass(entryClass) ? new entryClass(entry)
					: (_isFunction(entryClass) ? entryClass(entry) 
						: entry));
			Observer.set(_entries, name, entry);
		});
		return _entries;
	}
};