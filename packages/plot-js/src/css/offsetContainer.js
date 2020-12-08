
/**
 * The async type of readSync().
 *
 * @see readSync()
 *
 * @return Promise
 */
export default function(el, props, psuedo = null) {
	var positionType = readSync.call(this, el, 'position');
	return positionType === 'absolute' || positionType === 'relative' ? el.offsetParent : null;
};