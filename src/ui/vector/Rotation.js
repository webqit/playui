
/**
 * @imports
 */
import _isNumeric from '@webqit/util/js/isNumeric.js';
import Angle from './Angle.js';
import UIRect from './UIRect.js';

/**
 * Rotation UIRect.
 */
export default class Rotation extends UIRect {
    
    /**
     * Manipulates an element's translate.translate to place it with another element.
     *
     * @param object    params
     *
     * @return Array
     */
    css(params = {}) {
        var $css;
        $css = [
            {tansform: new TransformRule({rotate: 0,})},
            {tansform: new TransformRule({rotate: 0,})},
        ];
        $css.progress = {};
        $css.abs = [
            {tansform: new TransformRule({rotate: 0,})},
            {tansform: new TransformRule({rotate: 0,})},
        ];
        var activeTransform = cssSync.call(this.params.CNTXT, this.node, 'transform');
        $css[0].tansform.rotate = activeTransform.rotate;
        $css[1].tansform.rotate = this.angle;
        // ----------------
        $css.progress = Math.abs(activeTransform.rotate / this.angle);
        // ----------------
        $css.abs[0].tansform.rotate = 0;
        $css.abs[1].tansform.rotate = this.angle + activeTransform.rotate;
        return $css;
    }

    /**
     * Returns a new rect of source targettated by angle.
     *
     * @param Angle|UIRect|Element|Event|window 	source
     * @param UIRect|Element|Event|window 	    rect2
     * @param object                     	    origins
     *
     * @return Angle
     */
    static calculate(source, target, params = {}) {
        source = UIRect.calculate(source, params);
        var $rect = {source, target, transformation: 'rotation', ...source};
        if (_isNumeric(target)) {
            $rect.angle = target;
        } else {
            if (!(target instanceof Angle)) {
                target  = source.angleWith(target);
            }
            $rect.angle = target.angleOfElevation;
        }
        // Centers of the two rects
        //$rect.x = (rect2.left + (rect2.width / 2)) - (source.left + (source.width / 2));
        //$rect.y = (rect2.top + (rect2.height / 2)) - (source.top + (source.height / 2));
        // New coords
        $rect.left = source.left * Math.cos(radians($rect.angle)) + source.top * -Math.sin(radians($rect.angle));
        $rect.top = source.left * Math.sin(radians($rect.angle)) + source.top * Math.cos(radians($rect.angle));
        return new this($rect, params);
    }
}

/**
 * @radians()
 */
 function radians(deg) {
    return deg * (Math.PI / 180);
};