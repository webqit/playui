
/**
 * @imports
 */
import cssSync from '../../css/cssSync.js';
import UIRect from './UIRect.js';

/**
 * Scale UIRect.
 */
export default class Scale extends UIRect {
    
    /**
     * Manipulates an element's translate.translate to place it with another element.
     *
     * @param object    params
     *
     * @return Array
     */
    css(params = {}) {
        var $css;
        var axes = params.axis ? [params.axis] : ['x', 'y'],
            _lengths = {x: 'width', y: 'height'},
            lengths = axes.map(axis => _lengths[axis]);
        // -----------
        if (params.type === 'offsets') {
            // -----------
            $css = [{}, {}];
            $css.progress = {};
            $css.abs = [{}, {}];
            // -----------
            var currentSize = cssSync.call(this.params.CNTXT, this.node, lengths);
            lengths.forEach(name => {
                $css[0][name] = currentSize[name];
                $css[1][name] = this[name];
                // ----------------
                $css.progress[name] = Math.abs(currentSize[name] / this[name]);
                // ----------------
                $css.abs[0][name] = 0;
                $css.abs[1][name] = this[name];
            });
        } else {
            $css = [
                {tansform: new TransformRule({scale: [],})},
                {tansform: new TransformRule({scale: [],})},
            ];
            $css.progress = {};
            $css.abs = [
                {tansform: new TransformRule({scale: [],})},
                {tansform: new TransformRule({scale: [],})},
            ];
            var activeTransform = cssSync.call(this.params.CNTXT, this.node, 'transform');
            ['x', 'y'].forEach((axis, i) => {
                if (axis in coords) {
                    $css[0].tansform.scale[i] = activeTransform.scale[i];
                    $css[1].tansform.scale[i] = this[start[axis]];
                    // ----------------
                    $css.progress[axis] = Math.abs(activeTransform.scale[i] / (this[start[axis]] + activeTransform.scale[i]));
                    // ----------------
                    $css.abs[0].tansform.scale[i] = 0;
                    $css.abs[1].tansform.scale[i] = this[start[axis]] + activeTransform.scale[i];
                } else {
                    $css[0].tansform.scale[i] = activeTransform.scale[i];
                    $css[1].tansform.scale[i] = activeTransform.scale[i];
                    // ----------------
                    $css.progress[axis] = 0;
                    // ----------------
                    $css.abs[0].tansform.scale[i] = activeTransform.scale[i];
                    $css.abs[1].tansform.scale[i] = activeTransform.scale[i];
                }
            });
        }
       return $css;
    }

    /**
     * Returns a new rect of rect1 scaled to rect2.
     *
     * @param UIRect|Element|Event|window 	source
     * @param UIRect|Element|Event|window 	target
     * @param object                     	params
     *
     * @return Scale
     */
    static calculate(source, target, params = {}) {
        source = UIRect.calculate(source, params);
        target = UIRect.calculate(target, params);
        var $rect = {source, target, transformation: 'scale', ...source};
        $rect.left -= (target.width - source.width) / 2;
        $rect.top -= (target.height - source.height) / 2;
        return new this($rect, params);
    }
}
