
/**
 * @imports
 */
import _isNumeric from '@webqit/util/js/isNumeric.js';
import Angle from './Angle.js';
import Rect from './Rect.js';

/**
 * Returns a new rect of source targettated by angle.
 *
 * @param Angle|Rect|Element|Event|window 	source
 * @param Rect|Element|Event|window 	    rect2
 * @param object                     	    origins
 *
 * @return Angle
 */
export default function rotationTo(source, target, origins = {}) {
    source = Rect.of(source);
    var $rect = {source, target, transformation: 'rotation', ...source},
        angle;
    if (_isNumeric(target)) {
        angle = target;
    } else {
        if (!(target instanceof Angle)) {
            target  = source.angleWith(target);
        }
        angle = target.angleOfElevation;
    }
    // Centers of the two rects
    //$rect.x = (rect2.left + (rect2.width / 2)) - (source.left + (source.width / 2));
    //$rect.y = (rect2.top + (rect2.height / 2)) - (source.top + (source.height / 2));
    // New coords
    $rect.left = source.left * Math.cos(radians(angle)) + source.top * -Math.sin(radians(angle));
    $rect.top = source.left * Math.sin(radians(angle)) + source.top * Math.cos(radians(angle));
    return $rect;
};

/**
 * @radians()
 */
function radians(deg) {
    return deg * (Math.PI / 180);
};