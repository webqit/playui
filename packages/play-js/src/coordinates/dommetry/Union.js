
/**
 * @imports
 */
import cssAsync from '@webqit/plot-js/src/css/cssAsync.js';
import play from '../../animation/play.js';

/**
 * Calculates the figures required to place an element
 * at another reference point in the UI.
 */
export default class Union {

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
            {transform: this.translateFormatted.current.from},
            {transform: this.translateFormatted.to},
        ], timing);
    }

    /**
     * Coverts the UI coordinates to STATIC DOM/CSS coordinates.
     * 
     * @return Promise
     */
    css() {
        return cssAsync(this.el, {transform: this.translateFormatted.to});
    }
};
