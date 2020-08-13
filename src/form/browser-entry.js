
/**
 * @imports
 */
import * as Form from './index.js';

// As globals
if (!window.WebNative) {
	window.WebNative = {};
}
window.WebNative.Form = Form;
if (!window.WN) {
	window.WN = {};
}
window.WN.Form = Form;
