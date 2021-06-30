
/**
 * @imports
 */
import { getEls } from '../util.js';

/**
 * Appends matched to targets.
 *
 * @param Array|Element			els
 * @param Array|Element			targets
 *
 * @return this
 */
export default function(els, targets) {
	const _els = getEls.call(this, els);
	const _targets = getEls.call(this, targets);
	_targets.forEach((target, i) => {
		var __els = _els;
		if (i < _targets.length - 1) {
			__els = _els.map(el => el.cloneNode(true));
		}
		__els.forEach(el => {
			target.append(el); 
		});
	});
	return this; 
}
