
/**
 * @imports
 */
import readSync from './readSync.js';

/**
 * Parses the total width of the element's vertical borders.
 *
 * @param Array|Element 		els
 *
 * @return int
 */
export default function(els) {
	var borderWidth = 0;
	borderWidth += parseInt(readSync.call(this, els, 'border-left-width'));
	borderWidth += parseInt(readSync.call(this, els, 'border-right-width'));
	return borderWidth;
};
