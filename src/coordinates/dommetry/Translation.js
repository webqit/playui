
/**
 * @imports
 */
import _intersect from '@webqit/util/arr/intersect.js';
import _with from '@webqit/util/obj/with.js';
import cssRead from '../../css/readSync.js';
import cssAsync from '../../css/cssAsync.js';
import TransformRule from '../../css/classes/TransformRule.js';
import parseInset from '../parseInset.js';
import play from '../../animation/play.js';

/**
 * Calculates the figures required to place an element
 * at another reference point in the UI.
 */
export default class Translation {

    /**
     * Constructs a new instance.
     *
     * @param DOMRect   rect
     *
     * @return object
     */
    constructor(el) {
        this.rect = rect;
    }
    
    /**
     * Coverts the UI coordinates to ANIMATED DOM/CSS coordinates.
     * 
     * @param object    timing
     * @param object    params
     * 
     * @return Promise
     */
    play(timing = {}, params = {}) {
        return play(this.el, [
            {transform: $translation.current.from},
            {transform: $translation.to},
        ], timing);
    }

    /**
     * Coverts the UI coordinates to STATIC DOM/CSS coordinates.
     * 
     * @return Promise
     */
    css() {
        return cssAsync.call(WQ.DOM, this.el, {transform: $translation.to});
    }
    
    /**
     * Manipulates an element's translate.translate to place it with another element.
     *
     * @param object    options
     *
     * @return object
     */
    getTranslation(options = {}) {
        const $translation = {
            from: new TransformRule({translate: [],}),
            to: new TransformRule({translate: [],}),
            current: {
                from: new TransformRule({translate: [],}),
                to: new TransformRule({translate: [],}),
                progress: {},
            },
        };
        // -----------
        var activeTransform = cssRead.call(WQ.DOM, this.el, 'transform');
        ['x', 'y'].forEach((axis, i) => {
            if (axis in this.coords) {
                $translation.from.translate[i] = 0;
                $translation.to.translate[i] = this.coords[axis] + activeTransform.translate[i];
                // ----------------
                $translation.current.from.translate[i] = activeTransform.translate[i];
                $translation.current.to.translate[i] = this.coords[axis];
                // ----------------
                $translation.current.progress[axis] = Math.abs(activeTransform.translate[i] / (this.coords[axis] + activeTransform.translate[i]));
            } else {
                $translation.from.translate[i] = activeTransform.translate[i];
                $translation.to.translate[i] = activeTransform.translate[i];
                // ----------------
                $translation.current.from.translate[i] = activeTransform.translate[i];
                $translation.current.to.translate[i] = activeTransform.translate[i];
                // ----------------
                $translation.current.progress[axis] = 0;
            }
        });
       return $translation;
    }
   
    /**
     * Calculates an element's offset where it to be at the given rect.
     *
     * @param object    options
     *
     * @return object
     */
    getOffsets(options = {}) {
        var start = {x:'left', y:'top'};
        var end = {x:'right', y:'bottom'};
        var offsets = _intersect(['x', 'y'], Object.keys(this.coords)).reduce((obj, axis) => {
            switch(this.alignment[axis].keyword) {
                case 'before':
                    return options.alternateAnchors ? _with(obj, start[axis], this.coords[axis]) : _with(obj, end[axis], - this.coords[axis]);
                case 'after':
                    return options.alternateAnchors ? _with(obj, end[axis], - this.coords[axis]) : _with(obj, start[axis], this.coords[axis]);
                case 'end':
                    return _with(obj, end[axis], - this.coords[axis]);
                default: // center,start
                    return _with(obj, start[axis], this.coords[axis]);
            }
        }, {});
        // -----------
        const $offsets = {from: {}, to: {}, current: {
                from: {}, to: {}, progress: {},
            },
        };
        // -----------
        var currentOffsets = parseInset.call(WQ.DOM, this.el, Object.keys(offsets));
        ['left', 'right', 'top', 'bottom'].forEach(name => {
            if (name in offsets) {
                $offsets.from[name] = 0;
                $offsets.to[name] = offsets[name] + currentOffsets[name];
                // ----------------
                $offsets.current.from[name] = currentOffsets[name];
                $offsets.current.to[name] = offsets[name];
                // ----------------
                $offsets.current.progress[name] = Math.abs(currentOffsets[name] / (offsets[name] + currentOffsets[name]));
            } else {
                $offsets.from[name] = 'auto';
                $offsets.to[name] = 'auto';
                // ----------------
                $offsets.current.from[name] = 'auto';
                $offsets.current.to[name] = 'auto';
            }
        });
        return $offsets;
    }

    /**
     * Scrolls an element to the position of another element
     * within its scrollable parent.
     *
     * @param object    options
     *
     * @return object
     */
    getScroll(options = {}) {
        var viewport = options.scrollAnchor || getScrollParent(this.el);
        viewport = viewport === document.body ? window : viewport;
        if (!getCanScroll(viewport)) {
            return;
        }
        const $scroll = {from: {}, to: {}, current: {
                from: {}, to: {}, progress: {},
            },
            viewport: viewport,
        };
        // -----------
        const currentScroll = {
            scrollLeft: viewport[viewport === window ? 'pageXOffset' : 'scrollLeft'],
            scrollTop: viewport[viewport === window ? 'pageYOffset' : 'scrollTop'],
        };
        ['x', 'y'].forEach((axis, i) => {
            var axisProp = axis === 'x' ? 'scrollLeft' : 'scrollTop';
            if (axis in this.coords) {
                $scroll.from[axisProp] = 0;
                $scroll.to[axisProp] = this.coords[axis] + currentScroll[axisProp];
                // ----------------
                $scroll.current.from[axisProp] = currentScroll[axisProp];
                $scroll.current.to[axisProp] = this.coords[axis];
                // ----------------
                $scroll.current.progress[axis] = Math.abs(currentScroll[axisProp] / (this.coords[axis] + currentScroll[axisProp]));
            } else {
                $scroll.from[axisProp] = currentScroll[axisProp];
                $scroll.to[axisProp] = currentScroll[axisProp];
                // ----------------
                $scroll.current.from[axisProp] = currentScroll[axisProp];
                $scroll.current.to[axisProp] = currentScroll[axisProp];
                // ----------------
                $scroll.current.progress[axis] = 0;
            }
        });
        return $scroll;
    }
};


/**
 * Tells if an element is scrollable due to overflowing content.
 *
 * @param DOMNode		el
 *
 * @return bool
 */
function getCanScroll(el) {
    return el === window 
        ? (el.pageYOffset || el.pageYOffset) 
        : (el.scrollHeight > el.clientHeight);
};

/**
 * Gets an element's nearest scrollable parent.
 *
 * @param DOMNode		el
 *
 * @return Element
 */
function getScrollParent(el) {
    var style = window.getComputedStyle(el);
    var excludeStaticParent = style.position === 'absolute';
    var overflowRegex = false/*includeHidden*/ ? /(auto|scroll|hidden)/ : /(auto|scroll)/;
    if (style.position !== 'fixed') {
        for (var parent = el; (parent = parent.parentElement);) {
            style = window.getComputedStyle(parent);
            if (excludeStaticParent && style.position === 'static') {
                continue;
            }
            if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) {
                return parent;
            }
        }
    }
    return document.body;
};