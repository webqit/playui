
/**
 * @imports
 */
import _copyPlain from '@webqit/util/obj/copyPlain.js';
import _isArray from '@webqit/util/js/isArray.js';
import stylesheetRuleCallback from './stylesheetRuleCallback.js';
import parseRules from './parseRules.js';

/**
 * FInds the keyframes of the given animation name(s) across all stylesheets.
 *
 * @param string|array		name
 * @param bool				noCache
 * @param bool				normalize
 *
 * @return NULL|bool
 */
export default function(name, noCache, normalize = true) {
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
			var keyframe = parseRules(keyframeRule.cssText.replace(keyframeRule.keyText, '').replace('{', '').replace('}', '').trim());
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
	stylesheetRuleCallback.call(this, ruleDefinition => {
		if ((ruleDefinition.type === this.window.CSSRule.KEYFRAMES_RULE || ruleDefinition.type === this.window.CSSRule[this.prefix.api.toUpperCase() + '_KEYFRAMES_RULE'])
		&& (_isArray(name) ? name : [name]).indexOf(ruleDefinition.name) > -1) {
			allKeyframes = allKeyframes.concat(allKeyframes, parseKeyframes(ruleDefinition));
			return true;
		}
	}, true/*reversed*/);
	// Save
	stylesheetKeyframesCache[cacheKey] = allKeyframes;
	return allKeyframes;
};

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
