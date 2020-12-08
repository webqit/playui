
/**
 * @imports
 */
import Rect from './Rect.js';

/**
 * Returns coordinates of the union between two rects.
 *
 * @param Rect|Element|Event|window 	source
 * @param Rect|Element|Event|window 	target
 *
 * @return Union
 */
export default function unionWith(source, target) {
    source = Rect.of(source);
    target = Rect.of(target);
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
    return $rect;
};