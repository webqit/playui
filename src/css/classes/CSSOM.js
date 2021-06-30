
/**
 * @imports
 */
import _each from '@webqit/util/obj/each.js';
import CSSRule from './CSSRule.js';

/**
 * ----------------------------------------
 * An object of typed CSS rules.
 * ----------------------------------------
 */

export default class CSSOM {

    /**
     * Constructor
     * 
     * @param Object rules 
     */
    constructor(ruleObj) {
        _each(ruleObj, (prop, value) => {
            Object.defineProperty(this, prop, {value, enumerable: true});
        });
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
     * Stringifies the current instance of CSS rules into a string.
     *
     * @param Object params
     *
     * @return String
     */
    stringify(params = {}) {
        var rules = [];
        _each(this.stringifyEach(params), (prop, value) => {
            rules.push(`${prop}: ${value}`);
        });
        return rules.join('; ');
    }

    /**
     * Stringifies the current instance of CSS rules into a string.
     *
     * @param Object params
     *
     * @return Object
     */
    stringifyEach(params = {}) {
        var ruleObj = {};
        _each(this, (prop, value) => {
            if (value instanceof CSSRule) {
                value = value.stringify(params);
            } else if (_isObject(value)) {
                value = value.toString();
            }
            ruleObj[prop] = value;
        });
        return ruleObj;
    }

    /**
     * Parses a string of rules CSS into a harsh.
     *
     * @param String	 	css
     *
     * @return this
     */
    static parse(css, CNTXT = null) {
        return this.parseEach(css.split(';').filter(r => r).reduce((rules, rule) => {
            rules[rule[0].trim()] = rule[1].trim();
            return rules;
        }, {}), CNTXT);
    }

    /**
     * Normalizes each rule.
     * 
     * @param Object rules
     * 
     * @return this
     */
    static parseEach(rules, CNTXT = null) {
        var ruleObj = {};
        _each(rules, (prop, val) => {
            ruleObj[prop] = CSSRule.parse(prop, val, CNTXT);
        });
        return new this(ruleObj);
    }
}