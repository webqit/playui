
/**
 * @imports
 */
import _copy from '@webqit/util/obj/copy.js';
import _isArray from '@webqit/util/js/isArray.js';
import { vendorize, normalizeStylesheetProps } from './modules/global-css.js';
import { getPlayUIGlobal, getEls } from '../util.js';

/**
 * Returns inline-only CSS properties.
 *
 * @param Array|Element		els
 * @param string|object		prop
 * @param bool				noCache
 *
 * @return jQuery|object|string
 */
export default function(els, props, noCache = false) {
	const window  = getPlayUIGlobal.call(this, 'window');
	const _el = getEls.call(this, els)[0];
	// Ask cache first...
	var cacheKey = _isArray(props) ? props.join('|') : props;
	if (!noCache && stylesheetCache[cacheKey] && stylesheetCache[cacheKey].el === _el) {
		var copy = _copy(stylesheetCache[cacheKey]);
		delete copy.el;
		return copy;
	}
	// Find rules
	var allRules = [];
	normalizeStylesheetProps.call(this, ruleDefinition => {
		if (ruleDefinition.type === window.CSSRule.STYLE_RULE && _el.matches(ruleDefinition.selectorText)) {
			var propsList = props;
			if (!props/*original*/) {
				propsList = [];
				for (var i = 0; i < ruleDefinition.style.length; i ++) {
					propsList.push(ruleDefinition.style[i]);
				}
			}
			allRules.push(vendorize.call(this, propsList).reduce((_rulesObj, prop) => {
				_rulesObj[prop] = ruleDefinition.style[prop];
				return _rulesObj;
			}, {}));
		}
	});
	// Handle priority
	allRules.forEach(rules => {});
	// Save
	if (!stylesheetCache) {
		stylesheetCache = {};
	}
	stylesheetCache[cacheKey] = allRules.slice();
	stylesheetCache[cacheKey].el = _el;
	return allRules;
};
	
/**
 * @var object
 */
const stylesheetCache = {};
