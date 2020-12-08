
/**
 * @imports
 */
import readSync from './readSync.js';

/**
 * Parses the total width of the element's horizontal borders.
 *
 * @param DOMElement 		el
 *
 * @return int
 */
export default function(el) {
	var borderWidth = 0;
	borderWidth += parseInt(readSync.call(this, el, 'border-top-width'));
	borderWidth += parseInt(readSync.call(this, el, 'border-bottom-width'));
	return borderWidth;
};
