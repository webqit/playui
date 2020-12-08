
/**
 * @imports
 */
import _copy from '@webqit/util/obj/copy.js';
import _isArray from '@webqit/util/js/isArray.js';
import stylesheetRuleCallback from './stylesheetRuleCallback.js';
import ruleCallback from './ruleCallback.js';

/**
 * Returns inline-only CSS properties.
 *
 * @param HTMLElement		el
 * @param string|object		prop
 * @param bool				noCache
 * @param bool				withVendorVersions
 *
 * @return jQuery|object|string
 */
export default function(el, props, noCache, withVendorVersion = 'auto') {
	// Ask cache first...
	var cacheKey = _isArray(props) ? props.join('|') : props;
	if (!noCache && stylesheetCache[cacheKey] && stylesheetCache[cacheKey].el === el) {
		var copy = _copy(stylesheetCache[cacheKey]);
		delete copy.el;
		return copy;
	}
	// Find rules
	var allRules = [];
	stylesheetRuleCallback.call(this, ruleDefinition => {
		if (ruleDefinition.type === this.window.CSSRule.STYLE_RULE && el.matches(ruleDefinition.selectorText)) {
			var propsList = props;
			if (!props/*original*/) {
				propsList = [];
				for (var i = 0; i < ruleDefinition.style.length; i ++) {
					propsList.push(ruleDefinition.style[i]);
				}
			}
			allRules.push(ruleCallback.call(this, propsList, prop => {
				return ruleDefinition.style[prop];
			}, withVendorVersion));
		}
	});
	// Handle priority
	allRules.forEach(rules => {});
	// Save
	if (!stylesheetCache) {
		stylesheetCache = {};
	}
	stylesheetCache[cacheKey] = allRules.slice();
	stylesheetCache[cacheKey].el = el;
	return allRules;
};
	
/**
 * @var object
 */
const stylesheetCache = {};
