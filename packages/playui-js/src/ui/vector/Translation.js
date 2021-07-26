
/**
 * @imports
 */
import { _intersect } from '@webqit/util/arr/index.js';
import { _with } from '@webqit/util/obj/index.js';
import TransformRule from '../../css/classes/TransformRule.js';
import cssSync from '../../css/cssSync.js';
import UIRect from './UIRect.js';

/**
 * Translation UIRect.
 */
export default UIRect => class Translation extends UIRect { 
    
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
            start = {x:'left', y:'top'},
            end = {x:'right', y:'bottom'};
        // -----------
        if (params.type === 'offsets') {
            var offsets = axes.reduce((obj, axis) => {
                switch(this.alignment[axis].keyword) {
                    case 'before':
                        return params.alternateAnchors ? _with(obj, start[axis], this[start[axis]]) : _with(obj, end[axis], - this[start[axis]]);
                    case 'after':
                        return params.alternateAnchors ? _with(obj, end[axis], - this[start[axis]]) : _with(obj, start[axis], this[start[axis]]);
                    case 'end':
                        return _with(obj, end[axis], - this[start[axis]]);
                    default: // center,start
                        return _with(obj, start[axis], this[start[axis]]);
                }
            }, {});
            // -----------
            $css = [{}, {}];
            $css.progress = {};
            $css.abs = [{}, {}];
            // -----------
            var currentOffsets = parseInset.call(this.params.CNTXT, this.node, Object.keys(offsets));
            ['left', 'right', 'top', 'bottom'].forEach(name => {
                if (name in offsets) {
                    $css[0][name] = currentOffsets[name];
                    $css[1][name] = offsets[name];
                    // ----------------
                    $css.progress[name] = Math.abs(currentOffsets[name] / (offsets[name] + currentOffsets[name]));
                    // ----------------
                    $css.abs[0][name] = 0;
                    $css.abs[1][name] = offsets[name] + currentOffsets[name];
                } else {
                    $css[0][name] = 'auto';
                    $css[1][name] = 'auto';
                    // ----------------
                    $css.abs[0][name] = 'auto';
                    $css.abs[1][name] = 'auto';
                }
            });
        } else {
            $css = [
                {tansform: new TransformRule({translate: [],})},
                {tansform: new TransformRule({translate: [],})},
            ];
            $css.progress = {};
            $css.abs = [
                {tansform: new TransformRule({translate: [],})},
                {tansform: new TransformRule({translate: [],})},
            ];
            var activeTransform = cssSync.call(this.params.CNTXT, this.node, 'transform');
            ['x', 'y'].forEach((axis, i) => {
                if (axes.includes(axis)) {
                    $css[0].tansform.translate[i] = activeTransform.translate[i];
                    $css[1].tansform.translate[i] = this[start[axis]];
                    // ----------------
                    $css.progress[axis] = Math.abs(activeTransform.translate[i] / (this[start[axis]] + activeTransform.translate[i]));
                    // ----------------
                    $css.abs[0].tansform.translate[i] = 0;
                    $css.abs[1].tansform.translate[i] = this[start[axis]] + activeTransform.translate[i];
                } else {
                    $css[0].tansform.translate[i] = activeTransform.translate[i];
                    $css[1].tansform.translate[i] = activeTransform.translate[i];
                    // ----------------
                    $css.progress[axis] = 0;
                    // ----------------
                    $css.abs[0].tansform.translate[i] = activeTransform.translate[i];
                    $css.abs[1].tansform.translate[i] = activeTransform.translate[i];
                }
            });
        }
       return $css;
    }
}

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
function parseInset(el, anchors = ['left', 'top', 'right', 'bottom']) {
	var inverses = {right:'left', left:'right', bottom:'top', top:'bottom'};
	var currentOffsets = cssSync.call(this, el, anchors.concat('position'));
    var intersectionWithAnchor = null, rect;
    var getUIRect = () => {
        if (!rect) {
            rect = UIRect.calculate(el);
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
				intersectionWithAnchor = intersectionWithAnchor || getUIRect().intersectionWith(window);
				currentOffsets[name] = intersectionWithAnchor[name];
			} else if (currentOffsets.position === 'absolute') {
				intersectionWithAnchor = intersectionWithAnchor || getUIRect().intersectionWith(el.offsetParent);
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
}
