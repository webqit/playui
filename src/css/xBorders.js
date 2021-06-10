
/**
 * @imports
 */
import readSync from './readSync.js';

/**
 * Parses the total width of the element's horizontal borders.
 *
 * @param Array|Element 		els
 *
 * @return int
 */
export default function(els) {
	var borderWidth = 0;
	borderWidth += parseInt(readSync.call(this, els, 'border-top-width'));
	borderWidth += parseInt(readSync.call(this, els, 'border-bottom-width'));
	return borderWidth;
};
