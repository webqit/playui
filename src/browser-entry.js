
/**
 * @imports
 */
import * as Observables from './index.js';

// As globals
if (!window.WebNative) {
	window.WebNative = {};
}
window.WebNative.Observables = Observables;
if (!window.WN) {
	window.WN = {};
}
window.WN.Observables = Observables;
