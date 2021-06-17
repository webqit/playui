
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
import CSSOM from './modules/CSSOM.js';
import { vendorize } from './modules/global-css.js';
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
 * @param string			psuedo
 * @param function			styleCallback
 *
 * @return object|string
 */
 export function readSync(els, props, psuedo = null, styleCallback = null) {
	const window  = getPlayUIGlobal.call(this, 'window');
	const _el = getEls.call(this, els)[0];
	var style = window.getComputedStyle(_el, psuedo);
	var valsObj = _arrFrom(props).reduce((valsObj, prop) => {
		valsObj[prop] = style.getPropertyValue(vendorize.call(this, prop)[0]);
		return valsObj;
	}, {});
	return _isArray(props) ? valsObj : valsObj[props];
}

/**
 * Sets new CSS properties.
 *
 * @param Array|Element		els
 * @param string|object		nameOrProps
 * @param string|number		val
 *
 * @return this
 */
 export function writeSync(els, nameOrProps, val = null) {
	nameOrProps = _isString(nameOrProps)
		? _objFrom(nameOrProps, val)
		: nameOrProps;
	var ruleObj = nameOrProps instanceof CSSOM 
		? nameOrProps.stringifyEach() 
		: CSSOM.parseEach(nameOrProps, this).stringifyEach();
	getEls.call(this, els).forEach(el => {
		_each(ruleObj, (prop, val) => {
			el.style[vendorize.call(this, prop)[0]] = val;
		});
	});
	return this;
}