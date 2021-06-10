
/**
 * @imports
 */
import cssRead from '../css/readSync';
import Rect from './geometry/Rect.js';

/**
 * Gets the element's left,top,bottom,right values
 * with "auto"s resolved.
 * 
 * TODO: Support for margins
 *
 * @param HTMLElement			el 
 * @param array					anchors 
 *
 * @return object
 */
export default function(el, anchors = ['left', 'top', 'right', 'bottom']) {
	var inverses = {right:'left', left:'right', bottom:'top', top:'bottom'};
	var currentOffsets = cssRead.call(this, el, anchors.concat('position'));
    var intersectionWithAnchor = null, rect;
    var getRect = () => {
        if (!rect) {
            rect = Rect.of(el);
        }
        return rect;
    };
	anchors.forEach(name => {
		if (currentOffsets[name] === 'auto') {
			// Get what anchor value would be...
			// on current position type
			if (currentOffsets.position === 'relative') {
				currentOffsets[name] = - parseFloat(currentOffsets[inverses[name]]);
			} else if (currentOffsets.position === 'fixed') {
				intersectionWithAnchor = intersectionWithAnchor || getRect().intersectionWith(window);
				currentOffsets[name] = intersectionWithAnchor[name];
			} else if (currentOffsets.position === 'absolute') {
				intersectionWithAnchor = intersectionWithAnchor || getRect().intersectionWith(el.offsetParent);
				currentOffsets[name] = intersectionWithAnchor[name];
			} else /** static */ {
				currentOffsets[name] = 0;
			}
		} else {
			currentOffsets[name] = parseFloat(currentOffsets[name]);
		}
	});
	delete currentOffsets.position;
	return currentOffsets;
};
