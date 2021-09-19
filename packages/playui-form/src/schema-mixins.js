
/**
 * @imports
 */
import { _difference, _intersect, _unique } from '@webqit/util/arr/index.js';
import { _isBoolean, _isNull, _isNumeric, _isString } from '@webqit/util/js/index.js';

/**
 * @Schema Base Controller
 * @todo: anyOf, oneOf, allOf
 */
export const _Schema = __Schema => class extends (__Schema || class {}) {
    
    constructor(jsonSchema) {
        super(jsonSchema);
        // depreciated, readOnly, writeOnly, default, 
        // title, description, enum, const, examples, etc
        Object.keys(jsonSchema).forEach(name => {
            Object.defineProperty(this, name, { value: jsonSchema[name] });
        });
    }

    validate(instance) {
        return super.validate ? super.validate(instance) : { valid: true };
    }

}

/**
 * @ObjectOrArray Base Controller
 */
export const _ObjectOrArray = __ObjectOrArray => class extends _Schema(__ObjectOrArray) {

    validate(instance) {
        var validity = super.validate(instance);
        if (!validity.valid) return validity;
        if (!(validity = this._validateMin(instance)).valid) {
            return { valid: false, error: validity.error || `Minimum number of entries short of: ${validity.violation}.` };
        }
        if (!(validity = this._validateMax(instance)).valid) {
            return { valid: false, error: validity.error || `Maximum number of entries exceeded by: ${validity.violation}.` };
        }
        return validity;
    }

}

/**
 * @Object Controller
 */
export const _Object = __Object => class extends _ObjectOrArray(__Object) {

    getPropertyNameSchema(instanceHint = null) {
        var propertyNameSchema = this.propertyNames || { type: 'string' };
        if (this.additionalProperties === false) {
            propertyNameSchema.error = `Additional properties not allowed.`;
        }
        if (instanceHint) {
            // With instanceHint as hint, consider assisting the caller with
            // 1. Dynamically-generated names as options - names that aren't yet in the instance
        }
        propertyNameSchema.isRequired = true;
        return propertyNameSchema;
    }

    getPropertySchema(propertyName, instanceHint = null) {
        var propertySchema;
        if ((!this.properties || !(propertySchema = this.properties[propertyName]))
        && !(propertySchema = this._patternPropertiesMatch(propertyName))
        && !(propertySchema = this.additionalProperties) && propertySchema !== false) {
            propertySchema = { };
        }
        if (propertySchema) {
            // Also use "this.required" to hint this property schema about requiredness
            if ((this.required || []).includes(propertyName)) {
                propertySchema.isRequired = true;
            }
            if (instanceHint) {
                const instanceProperties = Object.keys(instanceHint);
                // With instance as hint, consider assisting the caller with dynamically-generated hints
                // 1. Use "this.dependentRequired" to hint this property schema about dependent-requiredness
                var requiringProp;
                if (!propertySchema.isRequired && (requiringProp = _intersect(this.dependentRequired || [], instanceProperties).reduce((masterHint, master) => masterHint || this.dependentRequired[master].includes(propertyName) ? master : null, null))) {
                    propertySchema.isRequired = requiringProp;
                }
                // 2. Info about whether this proposed entry will validate against "this.min/this.maxProperties"
                var validity;
                if (!instanceProperties.includes(propertyName) && !(validity = this._validateMax(instanceHint)).valid || validity.violation === 0/* currently exact maximum reached */) {
                    propertySchema.error = `This additional entry will violate the maximum number of entries allowed.`;
                }
                // 3. dynamic "type": the list of types in "this.allOf", "this.anyOf", "this.oneOf", not in "this.not"
            }
            return { ...propertySchema, name:propertyName };
        }
    }

    _patternPropertiesMatch(propertyName) {
        return Object.keys(this.patternProperties || {}).reduce((prev, pattern) => {
            if (prev) return prev;
            if ((new RegExp(pattern)).test(propertyName)) {
                return this.patternProperties[pattern];
            }
        }, null);
    }

    validate(instance) {
        var validity = super.validate(instance);
        if (!validity.valid) return validity;
        if (!(validity = this._validateRequired(instance)).valid) {
            return { valid: false, error: validity.error || `Required entries still empty: ${validity.violation.join(', ')}.` };
        }
        if (!(validity = this._validateDependentRequired(instance)).valid) {
            return { valid: false, error: validity.error || `Entries associated with "${validity.master}" still empty: ${validity.violation.join(', ')}.` };
        }
        return validity;
    }

    _validateMax(instance) {
        if (!this.maxProperties) return { valid: true };
        const instanceProperties = Object.keys(instance);
        const violation = instanceProperties.length - this.maxProperties;
        return { valid: violation <= 0, violation };
    }

    _validateMin(instance) {
        if (!this.minProperties) return { valid: true };
        const instanceProperties = Object.keys(instance);
        const violation = this.minProperties - instanceProperties.length;
        return { valid: violation <= 0, violation };
    }

    _validateRequired(instance) {
        if (!this.required) return { valid: true };
        const instanceProperties = Object.keys(instance);
        const violation = _difference(this.required, instanceProperties);
        return { valid: violation.length === 0, violation };
    }

    _validateDependentRequired(instance) {
        if (!this.dependentRequired) return { valid: true };
        const instanceProperties = Object.keys(instance);
        const [ master, violation ] = Object.keys(this.dependentRequired).reduce((prev, key) => {
            if (prev) return prev;
            if (instanceProperties.includes(key)) {
                const violation = _difference(this.dependentRequired[key], instanceProperties);
                if (violation.length) return [ key, violation ];
            }
        }, null) || [];
        return { valid: !master, master, violation };
    }
}

/**
 * @Array Controller
 */
 export const _Array = __Array => class extends _ObjectOrArray(__Array) {

    getItemSchema(itemIndex, instanceHint = null) {
        var itemSchema;
        if ((!this.prefixItems || !(itemSchema = this.prefixItems[itemIndex]))
        && !(itemSchema = this.items) && itemSchema !== false) {
            itemSchema = { };
        }
        if (itemSchema) {
            if (instanceHint) {
                // With instance as hint, consider assisting the caller with dynamically-generated hints
                // 1. Info about whether this proposed entry will validate against "this.min/this.maxProperties"
                var validity;
                if (!(itemIndex in instanceHint) && !(validity = this._validateMax(instanceHint)).valid || validity.violation === 0/* currently exact maximum reached */) {
                    itemSchema.error = `This additional entry will violate the maximum number of entries allowed.`;
                }
                // 2. "this.contains"
            }
            return { ...itemSchema, name:itemIndex };
        }
    }

    validate(instance) {
        var validity = super.validate(instance);
        if (!validity.valid) return validity;
        if (!(validity = this._validateUnique(instance)).valid) {
            return { valid: false, error: validity.error || `Entries must be unique` };
        }
        if (!(validity = this._validateContains(instance)).valid) {
            return { valid: false, error: validity.error || `Entries must contain ${validity.min > 0 ? `at least ${validity.min} ` + (validity.max > 1 ? 'and ' : '') : ''} ${validity.max > 1 ? `at most ${validity.max} ` : ''}of ${validity.desc}.` };
        }
        return validity;
    }

    _validateMax(instance) {
        if (!this.maxItems) return { valid: true };
        const violation = instance.length - this.maxItems;
        return { valid: violation <= 0, violation };
    }

    _validateMin(instance) {
        if (!this.minItems) return { valid: true };
        const violation = this.minItems - instance.length;
        return { valid: violation <= 0, violation };
    }

    _validateUnique(instance) {
        if (!this.uniqueItems) return { valid: true };
        return { valid: _unique(instance).length === instance.length };
    }

    _validateContains(instance) {
        if (!this.contains) return { valid: true };
        const passes = instance.filter(item => this.__validateContains(this.contains, item));
        if (passes.length < (this.minContains || 1)) {
            return { valid: false, min: this.minContains || 1, max: this.maxContains, desc };
        }
        if (this.maxContains && passes.length > this.maxContains) {
            return { valid: false, min: this.minContains || 1, max: this.maxContains, desc };
        }
        return { valid: true };
    }
}

/**
 * @String Controller
 */
export const _String = __String => class extends _Schema(__String) {

    validate(instance) {
        var validity = super.validate(instance);
        if (!validity.valid) return validity;
        return { valid: _isString(instance) };
    }

}

/**
 * @Num Controller
 */
export const _Num = __Num => class extends _Schema(__Num) {

    validate(instance) {
        var validity = super.validate(instance);
        if (!validity.valid) return validity;
        return validity;
    }

}

/**
 * @Number Controller
 */
export const _Number = __Number => class extends _Num(__Number) {
    
    validate(instance) {
        var validity = super.validate(instance);
        if (!validity.valid) return validity;
        return { valid: _isNumeric(instance) };
    }

}

/**
 * @Integer Controller
 */
export const _Integer = __Integer => class extends _Num(__Integer) {

    validate(instance) {
        var validity = super.validate(instance);
        if (!validity.valid) return validity;
        return { valid: Number.isInteger(instance) };
    }

}

/**
 * @Boolean Controller
 */
export const _Boolean = __Boolean => class extends _Schema(__Boolean) {

    validate(instance) {
        var validity = super.validate(instance);
        if (!validity.valid) return validity;
        return { valid: _isBoolean(instance) };
    }

}

/**
 * @Null Controller
 */
export const _Null = __Null => class extends _Schema(__Null) {

    validate(instance) {
        var validity = super.validate(instance);
        if (!validity.valid) return validity;
        return { valid: _isNull(instance) };
    }

}