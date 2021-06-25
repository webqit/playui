
/**
 * @imports
 */
import _isFunction from '@webqit/util/js/isFunction.js';
import _isString from '@webqit/util/js/isString.js';
import _isObject from '@webqit/util/js/isObject.js';
import _isArray from '@webqit/util/js/isArray.js';
import _objFrom from '@webqit/util/obj/from.js';
import _arrFrom from '@webqit/util/arr/from.js';
import _each from '@webqit/util/obj/each.js';
import _merge from '@webqit/util/obj/merge.js';
import _beforeLast from '@webqit/util/str/beforeLast.js';
import CSSOM from './modules/CSSOM.js';
import { vendorize, normalizeStylesheetProps, deriveSelector } from './modules/global-css.js';
import { getPlayUIGlobal, getEls } from '../util.js';

/**
 * The readSync() and writeSync() function in one signature.
 *
 * @param Array|Element		els
 * @param array				...args
 *
 * @return mixed
 */
export default function(els, ...args) {
	if ((args.length > 1 && _isString(args[0])) || _isObject(args[0])) {
		return writeSync.call(this, els, ...args);
	}
	return readSync.call(this, els, ...args);
}

/**
 * Returns computed CSS properties.
 *
 * @param Array|Element		els
 * @param string|array		props
 * @param object			params
 *
 * @return object|string
 */
export function readSync(els, props, params = {}) {
	const window  = getPlayUIGlobal.call(this, 'window');
	const _el = getEls.call(this, els)[0];
	params = params || {};
	// ------------
	if (params.scope === 'global') {
		return readGlobal.call(this, els, props, params);
	}
	if (params.scope === 'inline') {
		if (params.pseudo) {
			throw new Error(`Cannot read inline styles for pseudo element ${params.pseudo}. Invalid operation. Consider omitting the 'inline' flag.`);
		}
		return readInline.call(this, els, props);
	}
	var style = window.getComputedStyle(_el, params.pseudo);
	var valsObj = _arrFrom(props).reduce((valsObj, prop) => {
		valsObj[prop] = style.getPropertyValue(params.vendorize ? vendorize.call(this, prop)[0] : prop);
		return valsObj;
	}, {});
	return _isArray(props) ? valsObj : valsObj[props];
}

/**
 * Returns inline-only CSS properties.
 *
 * @param Array|Element		els
 * @param string|object		prop
 * @param object			params
 *
 * @return mixed
 */
export function readInline(els, props, params = {}) {
	const _els = getEls.call(this, els);
	params = params || {};
	// ------------
	var style = _els[0].getAttribute('style');
	if (props === 'all') {
		props = style.split(';').map(str => str.split(':')[0]);
	}
	var rulesObj = (params.vendorize ? vendorize.call(this, props) : _arrFrom(props)).reduce((_rulesObj, prop) => {
		var regex = new RegExp(';[ ]*?' + prop + ':([^;]+);?', 'g');
		_rulesObj[prop] = (regex.exec(';' + style) || ['', ''])[1].trim();
		return _rulesObj;
	}, {});
	return _isArray(props) ? rulesObj : rulesObj[props];
}

/**
 * Returns stylesheet-based CSS properties for an element.
 *
 * @param Array|Element		els
 * @param string|object		props
 * @param object			params
 *
 * @return object|string
 */
export function readGlobal(els, props, params = {}) {
	const window  = getPlayUIGlobal.call(this, 'window');
	const _el = getEls.call(this, els)[0];
	params = params || {};
	// ------------
	// Ask cache first...
	var cacheKey = _isArray(props) ? props.join('|') : props;
	if (!params.noCache && stylesheetCache[cacheKey] && stylesheetCache[cacheKey].el === _el) {
		var copy = stylesheetCache[cacheKey].slice();
		delete copy.el;
		return copy;
	}
	// Find rules
	var allRules = [];
	normalizeStylesheetProps.call(this, ruleDefinition => {
		var selectorToMatch = ruleDefinition.selectorText;
		if (params.pseudo) {
			var normalizedPseudo = params.pseudo.startsWith(':') && !params.pseudo.startsWith('::') 
				? ':' + params.pseudo 
				: params.pseudo;
			if (!ruleDefinition.selectorText.endsWith(normalizedPseudo)) {
				return;
			}
			selectorToMatch = _beforeLast(ruleDefinition.selectorText, normalizedPseudo);
		}
		if (ruleDefinition.type === window.CSSRule.STYLE_RULE && _el.matches(selectorToMatch)) {
			var propsList = _arrFrom(props);
			if (!props/*original*/) {
				propsList = [];
				for (var i = 0; i < ruleDefinition.style.length; i ++) {
					propsList.push(ruleDefinition.style[i]);
				}
			}
			allRules.push((params.vendorize ? vendorize.call(this, propsList) : propsList).reduce((_rulesObj, prop) => {
				_rulesObj[prop] = ruleDefinition.style[prop];
				return _rulesObj;
			}, {}));
		}
	});
	// Save
	if (!stylesheetCache) {
		stylesheetCache = {};
	}
	stylesheetCache[cacheKey] = allRules.slice();
	stylesheetCache[cacheKey].el = _el;
	if (params.all) {
		return allRules;
	}
	// TODO: Handle priority
	return allRules.reduce((ruleObj, rules) => _merge(ruleObj, rules), {});
}
	
/**
 * @var object
 */
const stylesheetCache = {};


/**
 * Sets new CSS properties.
 *
 * @param Array|Element		els
 * @param string|object		nameOrProps
 * @param string|number		val
 * @param object			params
 *
 * @return this
 */
export function writeSync(els, nameOrProps, val = null, params = {}) {
	params = (_isObject(nameOrProps) ? val : params) || {};
	nameOrProps = _isObject(nameOrProps) ? nameOrProps : _objFrom(nameOrProps, val);
	// ------------
	var ruleObj = nameOrProps instanceof CSSOM 
		? nameOrProps.stringifyEach() 
		: CSSOM.parseEach(nameOrProps, this).stringifyEach();
	// ------------
	if (params.scope === 'global') {
		return writeGlobal.call(this, els, ruleObj, params);
	}
	if (params.pseudo) {
		throw new Error(`Cannot write inline styles for pseudo element ${params.pseudo}. Invalid operation. Consider adding the 'global' flag.`);
	}
	const window  = getPlayUIGlobal.call(this, 'window');
	const _els = getEls.call(this, els);
	var propText;
	if (params.scope === 'inline' || params.prepend) {
		propText = Object.keys(ruleObj).map(prop => `${params.vendorize ? vendorize.call(this, prop)[0] : prop}: ${ruleObj[prop]}`).join(';');
	}
	_els.forEach(el => {
		if (params.scope === 'inline' || params.prepend) {
			var style = el.getAttribute('style') || '';
			if (!params.prepend && !style.trim().endsWith(';')) {
				style = style + ';';
			}
			el.setAttribute('style', (params.prepend ? propText + style : style + propText));
		} else {
			var style = el.style;
			_each(ruleObj, (prop, val) => {
				style.setProperty(params.vendorize ? vendorize.call(this, prop)[0] : prop, val);
			});
		}
	});
	return this;
}

/**
 * Sets new CSS properties globally.
 *
 * @param Array|Element		els
 * @param string|object		nameOrProps
 * @param string|number		val
 * @param object			params
 *
 * @return this
 */
var scratchPadEl, uuidCount = 0;
export function writeGlobal(els, nameOrProps, val = null, params = {}) {
	const window  = getPlayUIGlobal.call(this, 'window');
	const _els = getEls.call(this, els);
	params = (_isObject(nameOrProps) ? val : params) || {};
	nameOrProps = _isObject(nameOrProps) ? nameOrProps : _objFrom(nameOrProps, val);
	// ------------
	var sheet;
	if (params.noScratchPad) {
		sheet = _arrFrom(window.document.styleSheets).reduce((prev, current) => {
			try {
				// Test we can modify this stylesheet due to CORS
				current.cssRules;
				if (current.ownerNode.id !== 'Play-UI-Scratch-Pad') {
					return current;
				}
			} catch(e) {}
			return prev;
		}, null);
		if (!sheet) {
			throw new Error(`No editable stylesheet in document. Consider allowing to use a "scratchpad" stylesheet.`)
		}
	}
	if (!sheet) {
		if (!scratchPadEl) {
			scratchPadEl = window.document.createElement('style');
			window.document.head.appendChild(scratchPadEl);
			scratchPadEl.id = 'Play-UI-Scratch-Pad';
		}
		sheet = scratchPadEl.sheet;
	}
	// -------------------
	var propText = Object.keys(nameOrProps).map(prop => `${params.vendorize ? vendorize.call(this, prop)[0] : prop}: ${nameOrProps[prop]}`).join(';');
	_els.forEach(el => {
		var selector = deriveSelector.call(this, el, params);
		if (params.pseudo) {
			selector = `${selector}${params.pseudo}`;
		}
		sheet.insertRule(`${selector} {${propText}}`, params.prepend ? 0 : sheet.cssRules.length);
	});
	// -------------------
	return this;
}