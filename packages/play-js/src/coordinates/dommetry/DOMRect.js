
/**
 * @imports
 */
import Rect from '../geometry/Rect.js';
import Intersection from './Intersection.js';
import Union from './Union.js';
import Translation from './Translation.js';
import Scale from './Scale.js';
import Rotation from './Rotation.js';

/**
 * The Rect class.
 */
export default class DOMRect extends Rect {
    
    /**
     * Coverts the UI coordinates to ANIMATED DOM/CSS coordinates.
     * 
     * @param object    timing
     * @param object    params
     * 
     * @return Promise
     */
    async play(timing = {}, params = {}) {
        var driver = this.driver;
        await driver.play(timing, params);
        return this;
    }

    /**
     * Coverts the UI coordinates to STATIC DOM/CSS coordinates.
     * 
     * @return Promise
     */
    async css() {
        var driver = this.driver;
        await driver.css();
        return this;
    }

    /**
     * Returns the driver that
     * coverts the UI coordinates to DOM/CSS coordinates.
     *
     * @return Object
     */
    get driver() {
        if (this.geometry) {
            switch(this.geometry) {
                case 'intersection':
                    return new Intersection(this);
                case 'union':
                    return new Union(this);
            }
        }
        if (this.transformation) {
            switch(this.transformation) {
                case 'translation':
                    return new Translation(this);
                case 'scale':
                    return new Scale(this);
                case 'rotation':
                    return new Rotation(this);
            }
        }
    }

    /**
     * Returns the underlying node of the Rect.
     *
     * @return Rect#node
     */
    get node() {
        if (this.source) {
            return this.source.node;
        }
        return this.node;
    }
};