
/**
 * @imports
 */
import _isEmpty from '@web-native-js/commons/js/isEmpty.js';
import _isFunction from '@web-native-js/commons/js/isFunction.js';
import _arrFirst from '@web-native-js/commons/arr/first.js';
import _arrLast from '@web-native-js/commons/arr/last.js';
import _following from '@web-native-js/commons/arr/following.js';
import _preceding from '@web-native-js/commons/arr/preceding.js';
import _each from '@web-native-js/commons/obj/each.js';
import CollectionBase from '../CollectionBase.js';

/**
 * ---------------------------
 * The List class
 * ---------------------------
 */
			
export default class extends CollectionBase {

	/**
	 * Advances the list's selectedness to the
	 * first amount of items.
	 *
	 * @param number	length
	 *
	 * @return void
	 */
	selectStart(length = 1) {
		var firsts, items = this.getItemsArray();
		if (!_isEmpty(items) && (firsts = _arrFirst(items, length))) {
			firsts.forEach(item => item.setActiveState(true));
		}
	}

	/**
	 * Advances the list's selectedness to the
	 * last amount of items.
	 *
	 * @param number	length
	 *
	 * @return void
	 */
	selectEnd(length = 1) {
		var lasts, items = this.getItemsArray();
		if (!_isEmpty(items) && (lasts = _arrLast(items, length))) {
			lasts.forEach(item => item.setActiveState(true));
		}
	}
	
	/**
	 * Advances the list's selectedness to the
	 * item preceding the current activeChild.
	 * Selects the last item if loopable and no activeChild.
	 *
	 * @param number	length
	 * @param bool|function	loop
	 *
	 * @return object
	 */
	selectPrev(length = 1, loop = false) {
		var precedings, items = this.getItemsArray();
		if (_isEmpty(items)) {
			if (_isFunction(loop)) {
				loop();
			}
			return;
		}
		var precedings, reference = _arrFirst(this.activeChildren);
		if (reference) {
			precedings = _preceding(items, reference, length, loop);
		} else if (loop && (!_isFunction(loop) || loop(0))) {
			precedings = _arrLast(items, length);
		}
		precedings.forEach(item => item.setActiveState(true));
	}

	/**
	 * Advances the list's selectedness to the
	 * item following the current activeChild.
	 * Selects the first item if loopable and no activeChild.
	 *
	 * @param number	length
	 * @param bool|function	loop
	 *
	 * @return object
	 */
	selectNext(length = 1, loop = false) {
		var items = this.getItemsArray();
		if (_isEmpty(items)) {
			if (_isFunction(loop)) {
				loop();
			}
			return;
		}
		var followings, reference = _arrLast(this.activeChildren);
		if (reference) {
			followings = _following(items, reference, length, loop);
		} else if (loop && (!_isFunction(loop) || loop(0))) {
			followings = _arrFirst(items, length);
		}
		followings.forEach(item => item.setActiveState(true));
	}

	/**
	 * Advances the list's selectedness to some random items.
	 *
	 * @param number	length
	 *
	 * @return object
	 */
	selectRand(length = 1) {
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