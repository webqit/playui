
/**
 * @imports
 */
import * as Collection from './index.js';

// As globals
if (!window.WebNative) {
	window.WebNative = {};
}
window.WebNative.Collection = Collection;
if (!window.WN) {
	window.WN = {};
}
window.WN.Collection = Collection;
