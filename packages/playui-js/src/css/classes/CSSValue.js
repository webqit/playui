
/**
 * @imports
 */
import { _isNumeric, _isString } from '@webqit/util/js/index.js';
import { _beforeLast } from '@webqit/util/str/index.js';

 /**
  * ----------------------------------------
  * An object representing a CSS value and unit.
  * ----------------------------------------
  */
 
export default class CSSValue {

    /**
     * Constructor
     * 
     * @param Number val 
     * @param String unit 
     */
    constructor(val, unit = null) {
        this.val = val;
        this.unit = unit;
    }

    /**
     * Returns the type of unit of the current value
     */
    get unitType() {
        return this.constructor.absUnits.includes(this.unit) ? 'absolute' : (
            this.constructor.relUnits.includes(this.unit) ? 'relative' : null
        )
    }

    /**
     * @valueOf()
     * 
     * @return Any
     */
    valueOf() {
        return this.stringify();
    }

    /**
     * @alias of this.stringify()
     * 
     * @return String
     */
    toString() {
        return this.stringify();
    }

    /**
     * Stringifies the current instance of CSS value into a string.
     *
     * @param Object params
     *
     * @return String
     */
    stringify(params = {}) {
        return this.val + (this.unit ? this.unit : '');
    }

    /**
     * Parses a CSS value that may go with a unit.
     * 
     * @param String val
     *
     * @return this
     */
    static parse(val) {
        var unitTest;
        if (_isString(val) && (unitTest = this.absUnits.concat(this.relUnits).reduce((test, unit) => test || (val.endsWith(unit) ? unit : null), null))) {
            var _val = _beforeLast(val, unitTest);
            if (_isNumeric(_val)) {
                val = _val;
            }
        }
        return new this(val, unitTest);
    }
}

/**
 * CSS absolute units.
 *
 * @var array
 */
CSSValue.absUnits = ['cm', 'mm', 'Q', 'in', 'pc', 'pt', 'px'];

/**
 * CSS relative units.
 *
 * @var array
 */
CSSValue.relUnits = ['em', 'ex', 'ch', 'rem', 'lh', 'vw', 'vh', 'vmin', 'vmax'];