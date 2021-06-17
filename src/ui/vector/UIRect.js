
/**
 * @imports
 */
import _isObject from '@webqit/util/js/isObject.js';
import _any from '@webqit/util/arr/any.js';
import Intersection from './Intersection.js';
import Union from './Union.js';
import Rotation from './Rotation.js';
import Scale from './Scale.js';
import Translation from './Translation.js';
import Angle from './Angle.js';
import Proximity from './Proximity.js';

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
        this.params = params;
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
     * @see intersectionWith().
     *
    * @param UIRect|Element|Event|window 	reference
    * @param Object                     params
     *
     * @return Intersection
     */
    intersectionWith(reference, params = {}) {
        return Intersection.calculate(this, reference, params);
    }

    /**
     * @see unionWith().
     *
     * @param UIRect|Element|Event|window 	reference
     * @param Object                        params
     *
     * @return Union
     */
    unionWith(reference, params = {}) {
        return Union.calculate(this, reference, params = {});
    }
    
    /** --------- */

    /**
     * @see calcAngle().
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
     * @see calcProximity().
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
     * @see rotationTo().
     *
     * @param UIRect|Element|Event|window 	reference
     * @param Object                        params
     *
     * @return Rotation
     */
    rotationTo(reference, origin = {}) {
        return Rotation.calculate(this, reference, origin);
    }

    /**
     * @see scaleTo().
     *
     * @param UIRect|Element|Event|window 	reference
     * @param Object                        params
     *
     * @return Scale
     */
    scaleTo(reference, origin = {}) {
        return Scale.calculate(this, reference, origin);
    }
     
    /**
     * @see translationTo().
     *
     * @param UIRect|Element|Event|window 	reference
     * @param Object                  	    alignment
     * @param Object                        params
     *
     * @return Translation
     */
    translationTo(reference, alignment = {}, params = {}) {
        return Translation.calculate(this, reference, alignment, params);
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
            $rect = node.getBoundingClientUIRect().toJSON();
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