
/**
 * @imports
 */
import Observer from '@web-native-js/observer';
import _each from '@web-native-js/commons/obj/each.js';
import _isArray from '@web-native-js/commons/js/isArray.js';
import _isNull from '@web-native-js/commons/js/isNull.js';
import _isNumeric from '@web-native-js/commons/js/isNumeric.js';
import _mixin from '@web-native-js/commons/js/mixin.js';
import Collection from './Collection.js';
import Item from './Item.js';

/**
 * ---------------------------
 * The Route class
 * ---------------------------
 *
 * This class represents a given route and manages
 * its sub-route.
 */
			
export default class Route extends _mixin(Item, Collection) {

	/**
	 * Constructs a new Route instance.
	 * Sub-views may also be listed.
	 *
	 * Its content could either be static or remote.
	 *
	 * @param object				state
	 * @param object				params
	 *
	 * @return void
	 */
	constructor(items = {}, params = {}) {
		params.itemsOffset = 'subroutes';
		super(items, params);
		// -----------------------
		// Observe the Route's route-slot
		// -----------------------
		Observer.observe(this, 'active', delta => {
			if (delta.value === true && this.activeCallback) {
				this.activeCallback();
			}
		});
		// -----------------------
		// -----------------------
		if (this.initCallback) {
			this.initCallback();
		}
	}

	/**
	 * Binds subroutes to a route path slot.
	 *
	 * @param int|array			subroutingKeys
	 *
	 * @return void
	 */

	route(subroutingKeys = null) {
		// -------------------------------
		var subroutingKey, subroutingKeyForward;
		if (_isArray(subroutingKeys)) {
			subroutingKey = subroutingKeys.shift();
			subroutingKeyForward = subroutingKeys;
		} else {
			subroutingKey = subroutingKeys;
			subroutingKeyForward = _isNumeric(subroutingKey) 
				? parseInt(subroutingKeys) + 1 
				: null;
		}
		// -------------------------------
		var routerInstance = Router.init();
		var subroutingKeyType = 'pathmap';
		if (_isNumeric(subroutingKey)) {
			subroutingKey = parseInt(subroutingKey);
			subroutingKeyType = 'pathsplit';
		}
		var route = path => {
			// ---------------------------------
			if (this.active || this.activating) {
				var ownPath = [];
				_each(path, (key, val) => {
					if (key === subroutingKey) {
						return false;
					}
					ownPath.push(val);
				});
				Observer.set(this, 'ownPath', ownPath.join('/'));
			} else {
				Observer.del(this, 'ownPath');
			}
			// ---------------------------------
			var subroutingKeyVal = path[subroutingKey];
			if ((this.active || this.activating) && this.subroutes && subroutingKeyVal) {
				if (this.subroutes[subroutingKeyVal]) {
					if (!this.subroutes[subroutingKeyVal].active && !this.subroutes[subroutingKeyVal].activating) {
						return this.subroutes[subroutingKeyVal].setActiveState(true);
					}
				} else if (!_isNull(subroutingKeys)) {
					throw new Error('404: ' + subroutingKeyVal, this.subroutingKey);
				}
			} else if (this.current.active) {
				return this.current.active.setActiveState(false);
			}
			// ---------------------------------
		};
		route(routerInstance[subroutingKeyType]);
		Observer.observe(routerInstance, subroutingKeyType, delta => route(delta.value));
		// -------------------------------
		this.getItemsArray().forEach(route => route.route(subroutingKeyForward));

	}

	/**
	 * Creates Routes from declarations.
	 *
	 * @param object|array			routes
	 * @param object|function		routeClass
	 *
	 * @return object|array
	 */
	static createRoutes(routes, routeClass = Route) {
		return super.createEntries(routes, routeClass);
	}
};