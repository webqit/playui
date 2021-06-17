
/**
 * @imports
 */
import UIRect from './UIRect.js';

/**
 * Intersection UIRect.
 */
export default class Intersection extends UIRect {

    /**
     * Returns coordinates of the intersection between two rects.
     *
     * @param UIRect|Element|Event|window 	source
     * @param UIRect|Element|Event|window 	target
    * @param Object                     	params
    *
     * @return Intersection
     */
    static calculate(source, target, params = {}) {
        source = UIRect.calculate(source, params);
        target = UIRect.calculate(target, params);
        var $rect = {
            left: source.left - target.left,
            top: source.top - target.top,
            right: (target.left + target.width) - (source.left + source.width),
            bottom: (target.top + target.height) - (source.top + source.height),
            geometry: 'intersection',
        };
        // More offsets
        var leftline = Math.max(source.left, target.left);
        var rightline = Math.min(source.left + source.width, target.left + target.width);
        var topline = Math.max(source.top, target.top);
        var bottomline = Math.min(source.top + source.height, target.top + target.height);
        $rect.width = rightline > leftline ? rightline - leftline : 0;
        $rect.height = bottomline > topline ? bottomline - topline : 0;
        // The raw values
        $rect.source = source;
        $rect.target = target;
        return new this($rect, params);
    }
}
