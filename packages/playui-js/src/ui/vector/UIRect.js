
/**
 * @imports
 */
import { _isObject, _isNumeric } from '@webqit/util/js/index.js';
import { _any } from '@webqit/util/arr/index.js';
import Proximity from './Proximity.js';
import Angle from './Angle.js';
//import Rotation from './Rotation.js';
//import Scale from './Scale.js';
//import Translation from './Translation.js';

/**
 * The UIRect class.
 */
export default class UIRect {

    /**
     * Initializes a new UIRect instance.
     *
     * @param object	 					props
     * @param object	 					params
     *
     * @return void
     */
    constructor(props, params) {
        Object.keys(props).forEach(key => {
            Object.defineProperty(this, key, {
                get: () => props[key],
                enumerable: ['left', 'top', 'bottom', 'right', 'width', 'height',].includes(key),
            });
        });
        Object.defineProperty(this, 'params', {
            get: () => params,
            enumerable: false,
        });
    }
    
    /**
     * UIRecturns the offset values.
     * 
     * @return object
     */
    get offset() {
        return {
            top: this.top,
            left: this.left,
        };
    }

    /**
     * UIRecturns the size values.
     * 
     * @return object
     */
    get size() {
        return {
            width: this.width,
            height: this.height,
        };
    }

    /** --------- */

    /**
     * Calculates the angle of two rects.
     *
     * @param UIRect|Element|Event|window 	reference
     * @param Object                        params
     *
     * @return Angle
     */
    angleWith(reference, params = {}) {
        return Angle.calculate(this, reference, params);
    }
     
    /**
     * Calculates the proximity of two rects.
     *
     * @param UIRect|Element|Event|window 	reference
     * @param string|array	                axis
     * @param object		                previousProximity
     * @param Object                        params
     *
     * @return Proximity
     */
    proximityWith(reference, axis, previousProximity = null, params = {}) {
        return Proximity.calculate(this, reference, axis, previousProximity, params);
    }
    
    /** --------- */

    /**
     * Calculates the intersection of two rects.
     *
    * @param UIRect|Element|Event|window 	operand
    * @param Object                         params
     *
     * @return this
     */
    intersectionWith(operand, params = {}) {
        var UIRect = this.constructor;
        operand = UIRect.calculate(operand, params);
        var $rect = {
            left: this.left - operand.left,
            top: this.top - operand.top,
            right: (operand.left + operand.width) - (this.left + this.width),
            bottom: (operand.top + operand.height) - (this.top + this.height),
            geometry: 'intersection',
        };
        // More offsets
        var leftline = Math.max(this.left, operand.left);
        var rightline = Math.min(this.left + this.width, operand.left + operand.width);
        var topline = Math.max(this.top, operand.top);
        var bottomline = Math.min(this.top + this.height, operand.top + operand.height);
        $rect.width = rightline > leftline ? rightline - leftline : 0;
        $rect.height = bottomline > topline ? bottomline - topline : 0;
        // The raw values
        $rect.base = this;
        $rect.operand = operand;
        return new UIRect($rect, params);
    }

    /**
     * Calculates the union of two rects.
     *
     * @param UIRect|Element|Event|window 	operand
     * @param Object                        params
     *
     * @return Union
     */
    unionWith(operand, params = {}) {
        var UIRect = this.constructor;
        operand = UIRect.calculate(operand, params);
        var $rect = {
            left: Math.min(this.left, operand.left),
            top: Math.min(this.top, operand.top),
            right: Math.max((this.left + this.width), (operand.left + operand.width)),
            bottom: Math.max((this.top + this.height), (operand.top + operand.height)),
            geometry: 'union',
        };
        // More offsets
        $rect.width = $rect.right - $rect.left;
        $rect.height = $rect.bottom - $rect.top;
        // The raw values
        $rect.base = this;
        $rect.operand = operand;
        return new UIRect($rect, params);
    }
    
    /** --------- */

    /**
     * Calculates the rotation to another rects.
     *
     * @param UIRect|Element|Event|window 	operand
     * @param Object                        params
     *
     * @return Rotation
     */
    rotationTo(operand, params = {}) {
        var $rect = {base: this, operand, transformation: 'rotation', ...this};
        if (_isNumeric(operand)) {
            $rect.angle = operand;
        } else {
            if (!(operand instanceof Angle)) {
                operand  = this.angleWith(operand);
            }
            $rect.angle = operand.angleOfElevation;
        }
        // Centers of the two rects
        //$rect.x = (rect2.left + (rect2.width / 2)) - (this.left + (this.width / 2));
        //$rect.y = (rect2.top + (rect2.height / 2)) - (this.top + (this.height / 2));
        // New coords
        $rect.left = this.left * Math.cos(radians($rect.angle)) + this.top * -Math.sin(radians($rect.angle));
        $rect.top = this.left * Math.sin(radians($rect.angle)) + this.top * Math.cos(radians($rect.angle));
        var UIRect = this.constructor;
        return new UIRect($rect, params);
    }

    /**
     * Returns a new rect of rect1 scaled to rect2.
     *
     * @param UIRect|Element|Event|window 	operand
     * @param object                     	params
     *
     * @return Scale
     */
    scaleTo(operand, params = {}) {
        var UIRect = this.constructor;
        operand = UIRect.calculate(operand, params);
        var $rect = {base: this, operand, transformation: 'scale', ...this};
        $rect.left -= (operand.width - this.width) / 2;
        $rect.top -= (operand.height - this.height) / 2;
        return new UIRect($rect, params);
    }

    /**
     * Returns a new rect of base aligning with operand.
     *
     * @param UIRect|Element|Event|window 	operand
     * @param object                     	alignment
     * @param Object                     	params
     *
     * @return this
     */
    translationTo(operand, alignment = {}, params = {}) {
        var UIRect = this.constructor;
        var intersection = this.intersectionWith(operand);
        var alignment = {};
        var $rect = {base: this, operand, alignment, transformation: 'translation', ...this};
        var length = {x:'width', y:'height'};
        var start = {x:'left', y:'top'},
            end = {x:'right', y:'bottom'};
        ['x', 'y'].forEach(axis => {
            if (params[axis] === false) {
                return;
            }
            var thisLength = this[length[axis]/*height*/];
            // Distinguish and predicate
            alignment[axis] = parseDirective(params[axis] || '');
            switch(alignment[axis].keyword) {
                case 'before':
                    // Pull beyond start
                    $rect[start[axis]/*top*/] = - (intersection[start[axis]/*top*/] + thisLength);
                break;
                case 'after':
                    // Push beyond end
                    $rect[start[axis]/*top*/] = intersection[end[axis]/*bottom*/] + thisLength;
                break;
                case 'start':
                    // Pull to start
                    $rect[start[axis]/*top*/] = - intersection[start[axis]/*top*/];
                break;
                case 'end':
                    // Push to end
                    $rect[start[axis]/*top*/] = intersection[end[axis]/*bottom*/];
                break;
                default:
                    // Align to center
                    $rect[start[axis]/*top*/] = intersection.delta[axis];
            }
            // Apply predicates
            if (alignment[axis].predicates) {
                $rect[start[axis]/*top*/] += evalDirectivePredicates(alignment[axis].predicates, thisLength);
            }
        });
        return new UIRect($rect, params);
    }

    /**
     * Gets the element's width/height values or left/top offsets or both.
     *
     * A context can be specified from which to resolve left/top distances.
     * document origins are used by default.
     *
     * This function can calculate the rect of 3 different types of object:
     * - DOM element: offsets are calculated from el.getBoundingClientUIRect() and resolved relative to the specified params.offsetOrigin.
     *		width and height are calculated from el.getBoundingClientUIRect().
     * - Event object: offsets are calculated as the event's (client|offset|page) x/y, depending on the specified params.offsetOrigin.
     *		width and height are always 0, 0.
     * - Window object: offsets are calculated as the current left/top scroll, as determined by the value of params.offsetOrigin.
     *		width and height are always the window's inner width/height values.
     *
     * @param UIRect|Element|Event|window 	node
     * @param object	 					params
     *
     * @return object
     */
    static calculate(node, params = {}) {
        if (node instanceof UIRect) {
            return node;
        }
        var $rect;
        // --------------------------
        // WHERE params.offsetOrigin is an element or another rect,
        // both rects must be resolved on the same offsets: "page", "client", "offset"
        // --------------------------
        var offsetsResolution = ['page', 'document', window.document].includes(params.offsetOrigin) ? 'page' 
            : ((params.offsetOrigin instanceof window.Element) || params.offsetOrigin === 'offset' || params.offsetOrigin === true ? 'offset' 
                : (_isObject(params.offsetOrigin) && _isString(params.offsetOrigin.offsetsResolution) ? params.offsetOrigin.offsetsResolution 
                    : 'client'));
        // ---------------------------
        if (_isObject(node) && node !== window/*window also has screenX and screenY*/ 
        && _any(['clientX', 'clientY', 'offsetX', 'offsetY', 'pageX', 'pageY', 'screenX', 'screenY'], prop => prop in node)) {
            $rect = {width:0, height:0, type: 'event',};
            if (offsetsResolution === 'page') {
                // Relative to document
                $rect.left = $rect.right = node.pageX;
                $rect.top = $rect.bottom = node.pageY;
            } else if (offsetsResolution === 'offset') {
                // Relative to offset parent
                $rect.left = $rect.right = node.offsetX;
                $rect.top = $rect.bottom = node.offsetY;
                $rect.offsetOrigin = node.originalTarget;
            } else {
                // Relative to window
                $rect.left = $rect.right = node.clientX;
                $rect.top = $rect.bottom = node.clientY;
            }
        } else if (node === window) {
            $rect = {width: window.innerWidth, height: window.innerHeight, type: 'window',};
            if (offsetsResolution === 'page') {
                // Relative to document
                $rect.left = window.pageXOffset;// || document.documentElement.scrollLeft;
                $rect.top = window.pageYOffset;// || document.documentElement.scrollTop;
            } else {
                $rect.left = 0;
                $rect.top = 0;
            }
            $rect.right = $rect.left + $rect.width;
            $rect.bottom = $rect.top + $rect.height;
        } else if (node instanceof window.Element) {
            $rect = node.getBoundingClientRect().toJSON();
            $rect.type = 'element';
            delete $rect.x;
            delete $rect.y;
            // Resolves on "client" by default. Otherwise...
            if (offsetsResolution === 'page') {
                // Relative to document
                $rect.left += window.pageXOffset;// || document.documentElement.scrollLeft);
                $rect.top += window.pageYOffset;// || document.documentElement.scrollTop);
            } else if (params.offsetOrigin/* original */ === 'offset') {
                params.offsetOrigin = node.offsetParent;
            }
        } else if (node instanceof window.DOMRect) {
            $rect = node.toJSON();
            $rect.type = 'rect';
            delete $rect.x;
            delete $rect.y;
            // Resolves on "client" by default. Otherwise...
            if (offsetsResolution === 'page') {
                // Relative to document
                $rect.left += window.pageXOffset;// || document.documentElement.scrollLeft);
                $rect.top += window.pageYOffset;// || document.documentElement.scrollTop);
            } else if (offsetsResolution === 'offset') {
                throw new Error('DOMRects do not resolve on an offset!');
            }
        } else {
            throw new Error('Unknown object type!');
        }
        // -------------
        if (params.offsetOrigin instanceof window.Element) {
            var contextOffset = this.calculate(params.offsetOrigin, {
                ...params,
                instantiate: false,
                offsetOrigin: 'client',
            });
            $rect.left -= contextOffset.left;
            $rect.top -= contextOffset.top;
            $rect.right -= contextOffset.left;
            $rect.bottom -= contextOffset.top;
            $rect.offsetOrigin = params.offsetOrigin;
        }
        $rect.node = node;
        $rect.offsetsResolution = offsetsResolution;
        if (params.instantiate === false) {
            return $rect;
        }
        return new this($rect, params);
    }
}

/** ------- */

/**
 * @radians()
 */
function radians(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Parses a directive to obtain a placement keyword and alignment.
 *
 * @param string			 	expr
 *
 * @return object
 */
function parseDirective(expr) {
    var regPlacement = new RegExp('(before|after|start|end|center)', 'g');
    var regModifiers = new RegExp('[\-\+][0-9]+(%)?', 'g');
    return {
        keyword: (expr.match(regPlacement) || [])[0],
        predicates: expr.match(regModifiers.replace(/ /g, '')),
    };
}

/**
 * Sums a list of Mathematical expressions.
 *
 * @param array				 	alignment
 * @param number 				percentageContext
 *
 * @return number
 */
function evalDirectivePredicates(alignment, percentageContext) {
    return alignment.reduce((total, modifier) => total + (modifier.endsWith('%') 
        ? parseFloat(modifier) / 100 * percentageContext
        : parseFloat(modifier)
    ), 0);
}