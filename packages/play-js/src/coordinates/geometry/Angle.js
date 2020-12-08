
/**
 * @imports
 */
import _isNumeric from '@webqit/util/js/isNumeric.js';
import Rect from './Rect.js';

/**
 * -----------
 * Angle
 * -----------
 */
export default class Angle {

    /**
     * 
     * @param Object props 
     */
    constructor(props) {
        Object.keys(props).forEach(key => {
            Object.defineProperty(this, key, {get: () => props[key]});
        });
    }

    /**
     * Returns values of the angle between two rects.
     *
     * @param Rect|Element|Event|window 	rect1
     * @param Rect|Element|Event|window 	rect2
     *
     * @return Angle
     */
    static calculate(rect1, rect2) {
        rect1 = Rect.of(rect1);
        rect2 = Rect.of(rect2);
        var $angle = {};
        // Centers of the two rects
        $angle.x = (rect2.left + (rect2.width / 2)) - (rect1.left + (rect1.width / 2));
        $angle.y = (rect2.top + (rect2.height / 2)) - (rect1.top + (rect1.height / 2));
        // Hypotheneus
        $angle.z = Math.sqrt(Math.pow($angle.x, 2) + Math.pow($angle.y, 2));
        // Angle
        if (_isNumeric($angle.y) && _isNumeric($angle.x)) {
            $angle.angleOfElevation = Math.atan($angle.y / $angle.x);
        } else if (_isNumeric($angle.x) && _isNumeric($angle.z)) {
            $angle.angleOfElevation = Math.acos($angle.x / $angle.z);
        } else if (_isNumeric($angle.y) && _isNumeric($angle.z)) {
            $angle.angleOfElevation = Math.asin($angle.y / $angle.z);
        }
        $angle.angleOfDepression = 180 - 90 - $angle.angleOfElevation;
        $angle.isHorizontal = angleOfElevation < 45;
        $angle.isVertical = angleOfDepression < 45;
        return new this($angle);
    }
};