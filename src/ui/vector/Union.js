
/**
 * @imports
 */
import UIRect from './UIRect.js';

/**
 * Angle UIRect.
 */
export default class Union extends UIRect {

    /**
     * Returns coordinates of the union between two rects.
     *
     * @param UIRect|Element|Event|window 	source
     * @param UIRect|Element|Event|window 	target
     * @param Object                     	params
     *
     * @return Union
     */
    static calculate(source, target, params = {}) {
        source = UIRect.calculate(source, params);
        target = UIRect.calculate(target, params);
        var $rect = {
            left: Math.min(source.left, target.left),
            top: Math.min(source.top, target.top),
            right: Math.max((source.left + source.width), (target.left + target.width)),
            bottom: Math.max((source.top + source.height), (target.top + target.height)),
            geometry: 'union',
        };
        // More offsets
        $rect.width = $rect.right - $rect.left;
        $rect.height = $rect.bottom - $rect.top;
        // The raw values
        $rect.source = source;
        $rect.target = target;
        return new this($rect, params);
    }
}
