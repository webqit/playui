
/**
 * @imports
 */
import _fromCamel from '@webqit/util/str/fromCamel.js';
import _toCamel from '@webqit/util/str/toCamel.js';
import _arrFrom from '@webqit/util/arr/from.js';
import _isArray from '@webqit/util/js/isArray.js';
import { getPlayUIGlobal } from '../../util.js';

/**
 * CSS properties that must go with a unit.
 *
 * @var array
 */
export const unitBasedProps = ['width', 'height', 'top', 'left', 'right', 'bottom',
	'padding', 'padding-top', 'padding-left', 'padding-right', 'padding-bottom',
	'margin', 'margin-top', 'margin-left', 'margin-right', 'margin-bottom',
	'border-width', 'border-top-width', 'border-left-width', 'border-right-width', 'border-bottom-width',
	'outline-width', 'outline-top-width', 'outline-left-width', 'outline-right-width', 'outline-bottom-width',
].reduce((props, prop) => props.concat(prop, _toCamel(prop)), []);

/**
 * Returns the vendor-specific css property if supported. NULL if not.
 *
 * @param String|Array 	props
 * @param Bool 	withStd
 *
 * @return Array
 */
export function vendorize(props, withStd = true) {
    const window  = getPlayUIGlobal.call(this, 'window');
    const prefix = getPlayUIGlobal.call(this, 'vendor').getPrefix();
    var vendorizedProps = _arrFrom(props).reduce((all, prop) => {
        var camelCasedProp = _toCamel(prop, true);
        if ((prefix.api + camelCasedProp) in window.document.body.style) {
            all.push(prop.includes('-') 
                ? prefix.css + _fromCamel(prop, '-').toLowerCase()
                : prefix.api + camelCasedProp
            );
            if (!withStd) {
                return all;
            }
        }
        return all.concat(prop);
    }, []);
    return vendorizedProps;
}

/**
 * Loops thru all rules in all stylesheets (in reverse order possible).
 *
 * @param function			callback
 * @param bool				reversed
 *
 * @return NULL|bool
 */
export function normalizeStylesheetProps(callback, reversed = false) {
    const window  = getPlayUIGlobal.call(this, 'window');
	var stylesheets = window.document.styleSheets;
	var stylesheetCallback = function(stylesheet) {
		try {
			for (var k = 0; k < stylesheet.cssRules.length; k ++) {
				var ruleDefinition = stylesheet.cssRules[k];
				if (callback(ruleDefinition) === true) {
					return true;
				}
			}
		} catch (e) {}
	}
	if (reversed) {
		for (var i = stylesheets.length - 1; i >= 0; i --) {
			if (stylesheetCallback(stylesheets[i]) === true) {
				return true;
			}
		}
	} else {
		for (var i = 0; i < stylesheets.length; i ++) {
			if (stylesheetCallback(stylesheets[i]) === true) {
				return true;
			}
		}
	}
}

/**
 * Returns the value of a CSS variable.
 *
 * @param String 	name
 *
 * @return String|NULL
 */
export function readVar(name) {
    const window  = getPlayUIGlobal.call(this, 'window');
    var name = !name.indexOf('-') ? _fromCamel(name, '-') : name;
    return window.getComputedStyle(window.document.body).getPropertyValue('--' + name);
}

/**
 * FInds the keyframes of the given animation name(s) across all stylesheets.
 *
 * @param string|array		name
 * @param bool				noCache
 * @param bool				normalize
 *
 * @return NULL|bool
 */
export function readKeyframes(name, noCache, normalize = true) {
	const window  = getPlayUIGlobal.call(this, 'window');
	const prefix  = getPlayUIGlobal.call(this, 'prefix').getPrefix();
	
	// Ask cache first...
	var cacheKey = _isArray(name) ? name.join('|') : name;
	if (!noCache && stylesheetKeyframesCache[cacheKey]) {
		return stylesheetKeyframesCache[cacheKey];
	}
	// Parse keyframes rule
	var parseKeyframes = function(ruleDefinition) {
		var keyframes = [];
		for (var i = 0; i < ruleDefinition.cssRules.length; i ++) {
			var keyframeRule = ruleDefinition.cssRules[i];
			var keyframe = CSSRule.parse(keyframeRule.cssText.replace(keyframeRule.keyText, '').replace('{', '').replace('}', '').trim());
			var offsets = (keyframeRule.keyText || ' ').split(',').map(key => key === 'from' ? 0 : (key === 'to' ? 1 : (parseInt(key) / 100)));
			if (normalize) {
				normalizeToWAAPI(keyframe, ['animation-', 'transition-']);
				while(offsets.length) {
					var _keyframe = _copyPlain(keyframe);
					_keyframe.offset = offsets.shift();
					keyframes.push(_keyframe);
				}
			} else {
				keyframe.offset = offsets.length > 1 ? offsets : offsets[0];
				keyframes.push(keyframe);
			}
		}
		return keyframes.sort((a, b) => a.offset === b.offset ? 0 : a.offset > b.offset ? 1 : -1);
	};
	// Find keyframes
	var allKeyframes = [];
	normalizeStylesheetProps.call(this, ruleDefinition => {
		if ((ruleDefinition.type === window.CSSRule.KEYFRAMES_RULE || ruleDefinition.type === window.CSSRule[prefix.api.toUpperCase() + '_KEYFRAMES_RULE'])
		&& (_isArray(name) ? name : [name]).indexOf(ruleDefinition.name) > -1) {
			allKeyframes = allKeyframes.concat(allKeyframes, parseKeyframes(ruleDefinition));
			return true;
		}
	}, true/*reversed*/);
	// Save
	stylesheetKeyframesCache[cacheKey] = allKeyframes;
	return allKeyframes;
}

/**
 * Normalizes CSS animation properties to WAAPI compatible properties
 *
 * @param object			animationProps
 * @param string|arrau		prefix
 * @param string|arrau		offset
 *
 * @return null
 */
const normalizeToWAAPI = function(animationProps, offset, prefix = '') {
	if (_isArray(prefix)) {
		prefix.forEach(pref => normalizeToWAAPI(animationProps, pref));
		return;
	}
	if (animationProps[prefix + 'timing-function']) {
		animationProps.easing = animationProps[prefix + 'timing-function'];
		delete animationProps[prefix + 'timing-function'];
	}
	if (animationProps[prefix + 'fill-mode']) {
		animationProps.fill = animationProps[prefix + 'fill-mode'];
		delete animationProps[prefix + 'fill-mode'];
	}
	if (animationProps[prefix + 'iteration-count']) {
		animationProps.iterations = animationProps[prefix + 'iteration-count'];
		delete animationProps[prefix + 'iteration-count'];
		if (animationProps.iterations === 'infinite') {
			animationProps.iterations = Infinity;
		}
	}
};
	
/**
 * @var object
 */
const stylesheetKeyframesCache = {};