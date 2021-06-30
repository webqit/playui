
/**
 * ----------------------------------------
 * An object of CSS quad shorthand rules - padding, margin, inset
 * ----------------------------------------
 */

export default class QuadRule {

    /**
     * Constructor
     * 
     * @param Object rules 
     */
    constructor(ruleObj) {
        _each(ruleObj, (propName, value) => {
            Object.defineProperty(this, propName, {value, enumerable: true});
        });
    }

    /**
     * @alias of this.stringify()
     * 
     * @return String
     */
    toString() {
        return this.stringify()
    }

    /**
     * Stringifies the current instance of CSS quad shorthand into a string.
     * 
     * @param Object params 
     * 
     * @return String
     */
    stringify(params = {}) {
        return this.constructor.props.map(p => this[p]).filter(v => v).join(' ');
    }

    /**
     * Parses a CSS quad shorthand string into a harsh.
     *
     * @param String	 	shorthand
     *
     * @return Object
     */
    static parse(shorthand) {
        return new this(shorthand.split(' ').filter(v => v).reduce((valsObj, val, i) => {
            valsObj[this.props[i]] = val;
            return valsObj;
        }, {}));
    }
}

/**
 * @var Array
 */
QuadRule.props = ['top', 'right', 'bottom', 'left'];