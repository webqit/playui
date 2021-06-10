
/**
 * @imports 
 */
import { getEls } from '../util.js';

/**
 * The async type of readSync().
 *
 * @see readSync()
 *
 * @return Promise
 */
export default function(els, props, psuedo = null) {
	const _els = getEls.call(this, els);
	var positionType = readSync.call(this, els, 'position');
	return positionType === 'absolute' || positionType === 'relative' ? _els[0].offsetParent : null;
};