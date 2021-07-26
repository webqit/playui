
/**
 * @imports
 */
import { _isObject, _isNumeric } from '@webqit/util/js/index.js';
import { unitBasedProps } from '../global-css.js';
import TransformRule from './TransformRule.js';
import QuadRule from './QuadRule.js';
import CSSValue from './CSSValue.js';

/**
 * ----------------------------------------
 * An object of rules. Contains utilities
 * for parsing different CSS rules
 * ----------------------------------------
 */

export default class CSSRule {

    /**
     * Constructor
     * 
     * @param String name 
     * @param Any value 
     */
    constructor(name, value) {
        this.name = name;
        this.value = value;
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
     * Stringifies a value for the given prop type.
     * 
     * @param Object params
     * 
     * @return String
     */
    stringify(params = {}) {
        var prop = this.name;
        var val = this.value;
        if (_isObject(val)) {
			if (QuadRule.props.includes(prop) && !(val instanceof QuadRule)) {
				val = new QuadRule(val);
			} else if (prop === 'transform' && !(val instanceof TransformRule)) {
				val = new TransformRule(val);
			} else if (val instanceof CSSValue) {
			    val = val.stringify(params);
            } else {
                val = val.toString();
            }
		}
        return val;
    }

    /**
     * Parses a value for the given prop type.
     * 
     * @param String prop 
     * @param Any val 
     * @param Object CNTXT
     * 
     * @return this
     */
    static parse(prop, val, CNTXT = null) {
        if (QuadRule.props.includes(prop)) {
            val = QuadRule.parse(val, CNTXT);
        } else if (prop === 'transform') {
            val = TransformRule.parse(val, CNTXT);
        } else {
            val = CSSValue.parse(val);
            if (unitBasedProps.includes(prop)) {
                if (_isNumeric(val.val) && !val.unit) {
                    val.unit = 'px';
                }
            }
        }
        return new this(prop, val);
    }
}