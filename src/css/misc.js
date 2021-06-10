
/**
 * @imports
 */
import { getPlayUIGlobal } from '../util.js';

/**
 * Gets an accurate width of the device scrollbar by running a test.
 * (Adapted from bootstrap.js)
 *
 * @return int
 */
const standardScrollbarWidth = function() {
	const window  = getPlayUIGlobal.call(this, 'window');
	var style = 'position:absolute;top:-9999px;width:50px;height:50px;overflow:scroll';
	var d = $('<div style="' + style + '"></div>');
	window.document.body.appendChild(d);
	// Answer 2
	c = d[0].offsetWidth - d[0].clientWidth;
	window.document.body.removeChild(d);
	return c;
};

/**
 * ------------------------------
 * Other utils.
 * ------------------------------
 */

/**
 * Tells if the element's width is defined as auto.
 *
 * @param HTMLElement el
 *
 * @return bool
 */
const isAutoWidth = function(el) {
};

/**
 * Tells if the element's height is defined as auto.
 *
 * @param HTMLElement el
 *
 * @return bool
 */
const isAutoHeight = function(el) {
};

/**
 * Parses/decodes the element's transform rule
 *
 * @param HTMLElement el
 *
 * @return object
 */
const transformRule = function(el) {
};

/**
 * @exports
 */
export {
	isAutoWidth,
	isAutoHeight,
	transformRule,
	standardScrollbarWidth,
};
