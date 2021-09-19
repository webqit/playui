
/**
 * @imports
 */
import Observer from '@webqit/observer';
import { _toTitle } from '@webqit/util/str/index.js';
import { _from as _arrFrom, _intersect } from '@webqit/util/arr/index.js';
import { _getType, _isBoolean, _isEmpty, _isTypeObject, _isArray, _isFunction, _isUndefined, _isObject } from '@webqit/util/js/index.js';
import { _isTextMediaType, _isFileUpload } from './utils/util.js';
import * as Schemas from './schema-mixins.js';

/**
 * @Root Base Controller
 */
export const _Root = __Root => class extends (__Root || class {}) {

    static getSchemaName(type) {
        type = _arrFrom(type || 'string');
        return [
            ['object', '_Object'],
            ['array', '_Array'],
            ['string', '_String'],
            ['number', '_Number'],
            ['integer', '_Integer'],
            ['boolean', '_Boolean'],
            ['null', '_Null']
        ].reduce((name, pair) => name || (type.includes(pair[0]) ? pair[1] : null), null);
    }

    setSchema(schema, parentWidget = null) {
        Observer.set(this, 'schema', Observer.proxy(schema));
        Observer.set(this, 'parentWidget', parentWidget);
        Observer.set(this, 'attrs', Observer.proxy({
            name: this.parentWidget && this.parentWidget.attrs.name ? `${this.parentWidget.attrs.name}[${this.schema.name}]` : this.schema.name
        }));
        if (!this.schema.title) {
            this.schema.title = _toTitle(((this.schema.name || '') + '').replaceAll('_', ' '));
        }
        if (this.schema.isRequired) {
            this.attrs.required = true;
        }
        if (!_isUndefined(this.schema.const) || !_isUndefined(this.schema.default)) {
            this.attrs.value = !_isUndefined(this.schema.const) ? this.schema.const : this.schema.default;
        }
        if (this.schema.readOnly || !_isUndefined(this.schema.const)) {
            this.attrs.readonly = true;
        }
    }

};

/**
 * @ParentRoot Base Controller
 */
export const _ParentRoot = __ParentRoot => class extends _Root(__ParentRoot) {

    deriveChildWidget(childSchema) {}

    renderChildWidget(childWidget, childSchema, removeCallback = null) {}

};

/**
 * @Collection Controller
 */
export const _Collection = __Collection => class extends _ParentRoot(__Collection) {
        
    static testSchema(jsonSchema) {
        return _arrFrom(jsonSchema.type).includes('object');
    }

    setSchema(jsonSchema, parentWidget = null) {
        super.setSchema(new (Schemas._Object())(jsonSchema), parentWidget);
        Observer.set(this, 'entries', Observer.proxy({}));
        Object.keys(this.schema.properties || {}).forEach(propertyName => {
            const propertySchema = this.schema.getPropertySchema(propertyName);
            this.addResolvedEntry(propertyName, propertySchema);
        });
    }

    addResolvedEntry(propertyName, propertySchema) {
        const childWidget = this.renderChildWidget(this.deriveChildWidget(propertySchema), propertySchema, () => {
            if (this.entries[propertyName] === childWidget)
            delete this.entries[propertyName];
        });
        if (childWidget) {
            this.entries[propertyName] = childWidget;
        } else {
            console.warn(`No widget type defined for entry "${propertyName}" of schema type "${_arrFrom(propertySchema.type || 'string').join(', ')}".`);
        }
        return childWidget;
    }

    extend(propertyName, callback = null) {
        if (_isFunction(propertyName)) {
            const promptPropertyName = () => {
                const propertyNameSchema = this.schema.getPropertyNameSchema(this.json());
                propertyName(propertyNameSchema, _propertyName => {
                    if (propertyNameSchema.validate(_propertyName)) {
                        extend(_propertyName, callback);
                    } else {
                        promptPropertyName();
                    }
                });
            }
            promptPropertyName();
        } else if (propertyName) {
            const instanceHint = this.json();
            const propertySchema = this.schema.getPropertySchema(propertyName, instanceHint);
            const childWidget = this.addResolvedEntry(propertyName, propertySchema);
            if (callback) {
                callback(childWidget);
            }
        }
    }

    json(data = {}) {
        if (arguments.length) {
            if (!_isObject(data)) throw new Error(`Data must be a valid JSON object.`);
            Object.keys(data).forEach(name => {
                if (!this.entries[name]) throw new Error(`Entry "${name}" not in collection.`);
                this.entries[name].json(data[name]);
            });
            return;
        }
        // ------------------
        const _data = {};
        Object.keys(this.entries).forEach(name => {
            _data[name] = this.entries[name].json();
        });
        return _data;
    }
    
};
    
/**
 * @Multiple Controller
 */
export const _Multiple = __Multiple => class extends _ParentRoot(__Multiple) {
     
    static testSchema(jsonSchema) {
        return _arrFrom(jsonSchema.type).includes('array');
    }

    setSchema(jsonSchema, parentWidget = null) {
        super.setSchema(new (Schemas._Array())(jsonSchema), parentWidget);
        Observer.set(this, 'entries', Observer.proxy([]));
        if (!_isEmpty(this.schema.prefixItems)) {
            this.schema.prefixItems.forEach(itemIndex => {
                const itemSchema = this.schema.getItemSchema(itemIndex);
                this.addResolvedEntry(itemIndex, itemSchema);
            });
        }
        if (this.schema.autoExtend === true) {
            this.extend();
        }
    }

    addResolvedEntry(itemIndex, itemSchema) {
        const childWidget = this.renderChildWidget(this.deriveChildWidget(itemSchema), itemSchema, () => {
            if (this.entries[itemIndex] === childWidget)
            delete this.entries[itemIndex];
        });
        if (childWidget) {
            this.entries[itemIndex] = childWidget;
        } else {
            console.warn(`No widget type defined for entry "${itemIndex}" of schema type "${_arrFrom(itemSchema.type || 'string').join(', ')}".`);
        }
        return childWidget;
    }

    extend(callback = null) {
        const instanceHint = this.json();
        const itemIndex = instanceHint.length;
        const itemSchema = this.schema.getItemSchema(itemIndex, instanceHint);
        const childWidget = this.addResolvedEntry(itemIndex, itemSchema);
        if (callback) {
            callback(childWidget);
        }
    }

    json(data = []) {
        if (arguments.length) {
            if (!_isArray(data)) throw new Error(`Data must be a valid JSON array.`);
            data.forEach((value, itemIndex) => {
                if (!this.entries[itemIndex]) throw new Error(`Entry "${itemIndex}" not in collection.`);
                this.entries[itemIndex].json(value);
            });
            return;
        }
        // ------------------
        return this.entries.filter(entry => entry).map(entry => entry.json());
    }

};

/**
 * @Multiple Controller
 */
export const _Multiple2 = __Multiple2 => class extends _Multiple(__Multiple2) {
            
    static testSchema(jsonSchema) {
        if (!super.testSchema(jsonSchema)) return;
        // Any enum is going to be array items each
        if (jsonSchema.enum) return;
        var entries = [],
            widgetLineContentLengthLimit = this.lineContentLengthLimit || 50;
        if (jsonSchema.prefixItems) {
            // super.testSchema() plus only "const" or "single-item enum", plus, nothing object-like, nor a string that execeeds widget line limit
            if (jsonSchema.prefixItems.some(item => (!('const' in item) && (item.enum || []).length !== 1) || _intersect(_arrFrom(item.type), ['array', 'object']).length || Math.max(item.minLength, item.maxLength, 0) > widgetLineContentLengthLimit)) return;
            entries = jsonSchema.prefixItems.map(item => ('const' in item) ? item.const : item.enum[0]);
        }
        if (jsonSchema.items) {
            // super.testSchema() plus nothing object-like, nor a string that execeeds widget line limit
            if (_intersect(_arrFrom(jsonSchema.items.type), ['array', 'object']).length || Math.max(jsonSchema.items.minLength, jsonSchema.items.maxLength, 0) > widgetLineContentLengthLimit) return;
            entries = entries.concat(jsonSchema.items.enum || /* may not always be enum */[]);
        }
        return !entries.some(item => _isTypeObject(item) || (item + '').length > widgetLineContentLengthLimit);
    }

    setSchema(jsonSchema, parentWidget = null) {
        super.setSchema(...arguments);
        if (this.schema.autoExtend !== false) {
            this.extend();
        }
    }
    
}

/**
 * @Enum Controller
 */
export const _Enum = __Enum => class extends _Root(__Enum) {

    static testSchema(jsonSchema) {
        return _isArray(jsonSchema.enum) || (
            // Or where an array with the following conditions that completely eliminates the idea of a schema-based items list:
            _arrFrom(jsonSchema.type).includes('array') && (
                // 1. where no jsonSchema.prefixItems (which would have been a schema) or where jsonSchema.prefixItems bundles its "const"s
                (_isEmpty(jsonSchema.prefixItems) || jsonSchema.prefixItems.every(item => ('const' in item) || (item.enum || []).length === 1))
                // 2. where no .items (meaning: "won't grow") or where .items bundles its "enums" which are themselves expected to be final as specified by .uniqueItems
                && (jsonSchema.items === false || (_isArray((jsonSchema.items || {}).enum) && jsonSchema.uniqueItems))
            )
        );
    }

    constructor() {
        super();
        Observer.set(this, 'entries', Observer.proxy([]));
    }

    setSchema(jsonSchema, parentWidget = null) {
        // Enums can be any type
        const schemaName = this.constructor.getSchemaName(jsonSchema.type);
        super.setSchema(new (Schemas[schemaName]())(jsonSchema), parentWidget);
        // -------------
        // Mine items...
        // -------------
        var entries = [];
        if (this.schema.enum) {
            entries = this.schema.enum.map((value, i) => ({ value, label: (this.schema.enumNames || {})[i] }));
        } else if (_arrFrom(this.schema.type || 'string').includes('array')) {
            // Array case 1:
            if (this.schema.prefixItems) {
                entries = this.schema.prefixItems.map(item => (
                    ('const' in item) ? { value: item.const, label: item.title } : { value: item.enum[0], label: item.title || (item.enumNames || [])[0] }
                ));
            }
            // Array case 2:
            if (this.schema.items) {
                this.schema.items.enum.forEach((item, i) => {
                    entries.push({ value: item, label: (this.schema.items.enumNames || [])[i] });
                });
            }
            // Expecting type array means "multiple"
            this.attrs.multiple = true;
            this.attrs.name += '[]';
            entries.forEach(item => {
                item.selected = true;
            });
        }
        if (_arrFrom(this.schema.type).includes('null')) {
            entries = [{ value: null }].concat(entries);
        }
        // ------------------
        entries.forEach((itemData, itemIndex) => {
            const itemWidget = this.renderItemWidget(this.deriveItemWidget(itemData, itemIndex), itemData, itemIndex, () => {
                if (this.entries[itemIndex] === itemWidget)
                delete this.entries[itemIndex];
            });
            if (itemWidget) {
                this.entries[itemIndex] = itemWidget;
            }
        });
    }

    deriveItemWidget(entry, itemIndex) {}

    renderItemWidget(enumItem, entry, itemIndex, removeCallback = null) {}

    json(data = {}) {
        if (arguments.length) return;
        return this.attrs.multiple ? [] : null;
    }
};

/**
 * @Enum2 Controller
 */
export const _Enum2 = __Enum2 => class extends _Enum(__Enum2) {
    
    static testSchema(jsonSchema) {
        if (!super.testSchema(jsonSchema)) return;
        var entries = [],
            widgetLineContentLengthLimit = this.lineContentLengthLimit || 50;
        if (jsonSchema.enum) {
            // super.testSchema() plus nothing object-like, nor a string that execeeds widget line limit
            if (_intersect(_arrFrom(jsonSchema.type), ['array', 'object']).length || Math.max(jsonSchema.minLength, jsonSchema.maxLength, 0) > widgetLineContentLengthLimit) return;
            entries = jsonSchema.enum;
        } else {
            if (jsonSchema.prefixItems) {
                // Only "const" or "single-item enum" - as ensured by super.testSchema(), plus, none should be object-like, nor a string that execeeds widget line limit
                if (jsonSchema.prefixItems.some(item => _intersect(_arrFrom(item.type), ['array', 'object']).length || Math.max(item.minLength, item.maxLength, 0) > widgetLineContentLengthLimit)) return;
                entries = jsonSchema.prefixItems.map(item => ('const' in item) ? item.const : item.enum[0]);
            }
            if (jsonSchema.items) {
                // super.testSchema() plus nothing object-like, nor a string that execeeds widget line limit
                if (_intersect(_arrFrom(jsonSchema.items.type), ['array', 'object']).length || Math.max(jsonSchema.items.minLength, jsonSchema.items.maxLength, 0) > widgetLineContentLengthLimit) return;
                entries = entries.concat(jsonSchema.items.enum);
            }
        }
        return !entries.some(item => _isTypeObject(item) || (item + '').length > widgetLineContentLengthLimit);
    }

}

/**
 * @File Controller
 */
export const _File = __File => class extends _Root(__File) {

    static testSchema(jsonSchema) {
        const _isFileSchema = _jsonSchema => {
            const schemaType = _arrFrom(_jsonSchema.type || 'string');
            return (schemaType.includes('string') && (_isFileUpload(_jsonSchema) || (_jsonSchema.contentMediaType && !_isTextMediaType(_jsonSchema.contentMediaType))));
        };
        return _isFileSchema(jsonSchema) || (
            _arrFrom(jsonSchema.type).includes('array') && jsonSchema.uniqueItems && _isEmpty(jsonSchema.prefixItems) && _isFileSchema(jsonSchema.items || {})
        );
    }

    constructor() {
        super();
        Observer.set(this, 'filesList', Observer.proxy([]));
    }

    setSchema(jsonSchema, parentWidget = null) {
        const schemaType = _arrFrom(jsonSchema.type);
        const $schema = schemaType.includes('array') ? Schemas._Array() : Schemas._String();
        super.setSchema(new $schema(jsonSchema), parentWidget);
        this.attrs.type = 'file';
        if (schemaType.includes('array')) {
            this.attrs.name += '[]';
            this.attrs.multiple = true;
        }
    }

    deriveItemWidget(entry, itemIndex) {}

    renderItemWidget(previewItem, entry, itemIndex) {}

    json(data = {}) {
        if (arguments.length) return;
        return this.attrs.multiple ? [] : null;
    }

};

/**
 * @InputRoot Base Controller
 */
export const _Input = __Input => class extends _Root(__Input) {

    setSchema(jsonSchema, parentWidget = null) {
        super.setSchema(...arguments);
        if (!_isUndefined(this.schema.default) || this.schema.examples) {
            this.attrs.placeholder = `E.g.: ${!_isUndefined(this.schema.default) ? this.schema.default : this.schema.examples[0]}`;
        }
    }

    json(data = {}) {
        if (arguments.length) return;
        return this.attrs.multiple ? [] : null;
    }

};

/**
 * @Editor Controller
 */
export const _Editor = __Editor => class extends _Input(__Editor) {
        
    static testSchema(jsonSchema) {
        const schemaType = _arrFrom(jsonSchema.type || 'string');
        return schemaType.includes('string') && ((jsonSchema.contentMediaType && _isTextMediaType(jsonSchema.contentMediaType)) || (
            Math.max(jsonSchema.maxLength, jsonSchema.minLength) >= 1024
        ));
    }

    setSchema(jsonSchema, parentWidget = null) {
        super.setSchema(new (Schemas._String())(jsonSchema), parentWidget);
    }

};

/**
 * @Input Controller
 */
export const _Text = __Text => class extends _Input(__Text) {
        
    static testSchema(jsonSchema) {
        return _arrFrom(jsonSchema.type || 'string').includes('string');
    }

    setSchema(jsonSchema, parentWidget = null) {
        super.setSchema(new (Schemas._String())(jsonSchema), parentWidget);
        this.attrs.type = 'text';
        if (this.schema.format === 'date') {
            this.attrs.type = 'date';
        } else if (this.schema.format === 'time') {
            this.attrs.type = 'time';
        } else if (this.schema.format === 'date-time') {
            this.attrs.type = 'datetime-local';
        } else if (this.schema.format === 'duration') {
            this.attrs.type = ''; // ?
        } else if (['uri', 'uri-reference', 'iri', 'iri-reference', 'uuid'].includes(this.schema.format)) {
            this.attrs.pattern = ''; // regex
        } else if (['hostname', 'idn-hostname'].includes(this.schema.format)) {
            this.attrs.pattern = ''; // regex
        } else if (['email', 'idn-email'].includes(this.schema.format)) {
            this.attrs.type = 'email';
        } else if (['ipv4', 'ipv6'].includes(this.schema.format)) {
            this.attrs.pattern = ''; // regex
        } else if (this.schema.format === 'password') {
            this.attrs.type = 'password';
        } else if (this.schema.format === 'color') {
            this.attrs.type = 'color';
        } else if (this.schema.format === 'phone') {
            this.attrs.pattern = '^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$';
        } else if (this.schema.format === 'postal-code') {
            this.attrs.pattern = '^[0-9]{5}(?:-[0-9]{4})?$';
        }
        // -----
        if (this.schema.maxLength) {
            this.attrs.maxlength = this.schema.maxLength;
        }
        if (this.schema.minLength) {
            this.attrs.minlength = this.schema.minLength;
        }
        if (this.schema.pattern) {
            this.attrs.pattern = this.schema.pattern;
        }
        if (!this.schema.col) {
            const col = this.schema.maxLength || 150;
            this.schema.col = Math.max(1, parseInt(col / (300 / 12)));
        }
        // -----
    }
    
};

/**
 * @Number Controller
 */
export const _Number = __Number => class extends _Input(__Number) {
        
    static testSchema(jsonSchema) {
        const schemaType = _arrFrom(jsonSchema.type);
        return schemaType.includes('integer') || schemaType.includes('number');
    }

    setSchema(jsonSchema, parentWidget = null) {
        super.setSchema(new (Schemas._Number())(jsonSchema), parentWidget);
        this.attrs.type = 'number';
        if (this.schema.exclusiveMaximum) {
            this.attrs.max = this.schema.exclusiveMaximum - 0.0001;
        } else if (this.schema.maximum) {
            // date, month, week, time, datetime-local, number, and range
            this.attrs.max = this.schema.maximum;
        }
        if (this.schema.exclusiveMinimum) {
            this.attrs.min = this.schema.exclusiveMinimum + 0.0001;
        } else if (this.schema.minimum) {
            // date, month, week, time, datetime-local, number, and range
            this.attrs.min = this.schema.minimum;
        }
        if (this.schema.multipleOf) {
            // number, date/time input types, and range
            this.attrs.step = this.schema.multipleOf;
        }
        if (!this.schema.col) {
            const col = this.schema.maxLength /* char width in sql */ || 50;
            this.schema.col = Math.max(1, parseInt(col / (300 / 12)));
        }
        // ------
    }
    
};

/**
 * @State Controller
 */
export const _State = __State => class extends _Root(__State) {
        
    static testSchema(jsonSchema) {
        return _arrFrom(jsonSchema.type).includes('boolean');
    }

    setSchema(jsonSchema, parentWidget = null) {
        super.setSchema(new (Schemas._Boolean())(jsonSchema), parentWidget);
        this.attrs.type = 'checkbox';
        if (this.schema.const === true || this.schema.default === true) {
            this.attrs.checked = true;
        }
    }

    json(data = {}) {
        if (arguments.length) return;
        return this.attrs.multiple ? [] : null;
    }
    
};