
/**
 * @imports
 */
import Observer from '@webqit/observer';
import { _toTitle } from '@webqit/util/str/index.js';
import { _from as _arrFrom, _intersect } from '@webqit/util/arr/index.js';
import { _getType, _isBoolean, _isEmpty, _isTypeObject, _isArray, _isFunction, _isUndefined, _isNumeric, _isObject } from '@webqit/util/js/index.js';
import { _isTextMediaType, _isFileUpload } from './utils/util.js';
import * as Schemas from './schema-mixins.js';

/**
 * @Root Base Controller
 */
export const _Root = __Root => class extends (__Root || class {}) {

    constructor() {
        super();
        this.nodeRemovalListeners = new Map;
    }

    execNodeRemoval(node) {
        if (_isFunction(node.remove)) {
            node.remove();
        }
    }

    onNodeRemoval(node, callback) {
        var listeners = this.nodeRemovalListeners.get(node);
        if (!listeners) {
            listeners = [];
            this.nodeRemovalListeners.set(node, listeners);
        }
        listeners.push(callback);
    }

    async remoteAction(method, url, options = {}) {
        return {};
    }

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

    define(schema, ownerWidget = null) {
        Observer.set(this, 'schema', Observer.proxy(schema));
        Observer.set(this, 'ownerWidget', ownerWidget);
        Observer.set(this, 'attrs', Observer.proxy({
            name: this.ownerWidget && this.ownerWidget.attrs.name ? `${this.ownerWidget.attrs.name}[${this.schema.name}]` : this.schema.name
        }));
        if (!this.state) {
            Observer.set(this, 'state', Observer.proxy({}));
        }
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

    alert(alert = null) {
        if (arguments.length) {
            this.state.alert = { message: alert.message, type: alert.type };
        }
        return { ...(this.state.alert || {}) };
    }

    json() {}

    set value(value) {
        this.json(value);
    }

    get value() {
        return this.json();
    }

};

/**
 * @ParentRoot Base Controller
 */
export const _ParentRoot = __ParentRoot => class extends _Root(__ParentRoot) {

    deriveChildEntry(childSchema, i) {}

};

/**
 * @Collection Controller
 */
export const _Collection = __Collection => class extends _ParentRoot(__Collection) {

    constructor() {
        super();
        Observer.set(this, 'childEntries', Observer.proxy({}));
        Observer.observe(this.childEntries, mutations => {
            mutations.forEach(m => {
                if (m.type === 'set') {
                    if (m.isUpdate && m.oldValue) {
                        this.execNodeRemoval(m.oldValue);
                    }
                    if (m.value) {
                        if (_isFunction(this.onNodeRemoval)) {
                            this.onNodeRemoval(m.value, () => {
                                if (this.childEntries[m.name] === m.value) {
                                    delete this.childEntries[m.name];
                                }
                            });
                        }
                    } else {
                        console.warn(`No widget type defined for entry "${m.name}" of schema type "${_arrFrom(this.schema.properties[m.name].type || 'string').join(', ')}".`);
                    }
                }
                if (m.type === 'deleteProperty') {
                    this.execNodeRemoval(m.oldValue);
                }
            });
        });
        // Better regex would allow you to not select the ${} characters. Try: /(?!\${)([^{}]*)(?=})/g
        function renderString(str,obj) {
            return str.replace(/\{.+?\}/g, match => {return index(obj,match)})
        }
    }
        
    static testSchema(jsonSchema) {
        return _arrFrom(jsonSchema.type).includes('object');
    }

    define(jsonSchema, ownerWidget = null) {
        super.define(new (Schemas._Object())(jsonSchema), ownerWidget);
        Object.keys(this.childEntries).forEach(propertyName => {
            delete this.childEntries[propertyName];
        });
        Object.keys(this.schema.properties || {}).forEach(propertyName => {
            const propertySchema = this.schema.getPropertySchema(propertyName);
            if (propertySchema.display !== false) {
                this.childEntries[propertyName] = this.deriveChildEntry(propertySchema, propertyName);
            }
        });        
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
            this.childEntries[propertyName] = this.deriveChildEntry(this.schema.getPropertySchema(propertyName, instanceHint), propertyName);;
            if (callback) {
                callback(this.childEntries[propertyName]);
            }
        }
    }

    json(data = {}, autoExtend = false) {
        if (arguments.length) {
            if (!_isObject(data)) throw new Error(`Data must be a valid JSON object.`);
            Object.keys(data).forEach(name => {
                if (this.childEntries[name]) {
                    this.childEntries[name].json(data[name]);
                } else if (autoExtend) {
                    this.extend(name, childEntry => {
                        childEntry.json(data[name]);
                    });
                }
            });
            return;
        }
        // ------------------
        const _data = {};
        Object.keys(this.childEntries).forEach(name => {
            _data[name] = this.childEntries[name].json();
        });
        return _data;
    }

    alert(alert = {}, autoExtend = false) {
        if (arguments.length) {
            super.alert(alert);
            if (alert.details && !_isObject(alert.details)) throw new Error(`Alert details must be a valid JSON object.`);
            Object.keys(alert.details || {}).forEach(name => {
                if (this.childEntries[name]) {
                    this.childEntries[name].alert(alert.details[name]);
                } else if (autoExtend) {
                    this.extend(name, childEntry => {
                        childEntry.alert(alert.details[name]);
                    });
                }
            });
            return;
        }
        // ------------------
        const _alert = super.alert(); _alert.details = {};
        Object.keys(this.childEntries).forEach(name => {
            _alert.details[name] = this.childEntries[name].alert();
        });
        return _alert;
    }
    
};
    
/**
 * @Multiple Controller
 */
export const _Multiple = __Multiple => class extends _ParentRoot(__Multiple) {

    constructor() {
        super();
        Observer.set(this, 'childEntries', Observer.proxy([]));
        Observer.observe(this.childEntries, mutations => {
            mutations.forEach(m => {
                if (m.name === 'length') return;
                if (m.type === 'set') {
                    if (m.isUpdate && m.oldValue && this.childEntries.indexOf(m.oldValue) === -1) {
                        this.execNodeRemoval(m.oldValue);
                    }
                    if (m.value) {
                        if (_isFunction(this.onNodeRemoval)) {
                            this.onNodeRemoval(m.value, () => {
                                const i = this.childEntries.indexOf(m.value);
                                if (i > -1) {
                                    this.childEntries.splice(i, 1);
                                }
                            });
                        }
                    } else {
                        console.warn(`No widget type defined for entry "${m.name}" of schema type "${_arrFrom(m.value.type || 'string').join(', ')}".`);
                    }
                }
                if (m.type === 'deleteProperty') {
                    if (this.childEntries.indexOf(m.oldValue) === -1) {
                        this.execNodeRemoval(m.oldValue);
                    }
                }
            });
        });
    }
     
    static testSchema(jsonSchema) {
        return _arrFrom(jsonSchema.type).includes('array');
    }

    define(jsonSchema, ownerWidget = null) {
        super.define(new (Schemas._Array())(jsonSchema), ownerWidget);
        this.childEntries.splice(0);
        if (!_isEmpty(this.schema.prefixItems)) {
            this.schema.prefixItems.forEach((itemSchema, itemIndex) => {
                this.childEntries.push(this.deriveChildEntry(itemSchema, itemIndex));
            });
        }
        if (this.schema.autoExtend === true) {
            this.extend();
        }
    }

    extend(callback = null) {
        const instanceHint = this.json();
        const itemIndex = instanceHint.length;
        const childEntry = this.deriveChildEntry(this.schema.getItemSchema(itemIndex, instanceHint), itemIndex);
        this.childEntries.push(childEntry);
        if (callback) {
            callback(childEntry);
        }
    }

    execNodeRemoval(node, confirm = null) {
        if (!confirm) {
            confirm = (msg, done) => done();
        }
        const i = this.childEntries.indexOf(node);
        if (i === -1) {
            return;
        }
        const name = !node.schema ? 'item' : (_isNumeric(node.schema.title) ? `item ${parseInt(node.schema.title) + 1}` : node.schema.title);
        if (this.schema.remoteDelete) {
            var value = node.value;
            if (value && !_isTypeObject(value)) {
                var deleteUrl = this.schema.remoteDelete.url.replace(/\{value\}/g, value);
                confirm(`Remove ${name} (and delete from your account)?`, () => {
                    return this.remoteAction(this.schema.remoteDelete.method || 'delete', deleteUrl).then(res => {
                        if (res.ok) {
                            super.execNodeRemoval(node);
                        }
                        return res;
                    });
                });
                return;
            }
        }
        confirm(`Remove ${name}?`, async () => {
            super.execNodeRemoval(node);
        });
    }

    json(data = []) {
        if (arguments.length) {
            if (!_isArray(data)) throw new Error(`Data must be a valid JSON array.`);
            data.forEach((value, itemIndex) => {
                if (this.childEntries[itemIndex]) {
                    this.childEntries[itemIndex].json(value);
                } else {
                    this.extend(childEntry => {
                        childEntry.json(value);
                    });
                }
            });
            return;
        }
        // ------------------
        return this.childEntries.filter(entry => entry).map(entry => entry.json());
    }

    alert(alert = {}, autoExtend = false) {
        if (arguments.length) {
            super.alert(alert);
            if (alert.details && !_isArray(alert.details) && !Object.keys(alert.details).every(k => _isNumeric(k))) throw new Error(`Alert items must be a valid JSON array.`);
            Object.keys(alert.details).forEach(itemIndex => {
                const _alert = alert.details[itemIndex];
                if (this.childEntries[itemIndex]) {
                    this.childEntries[itemIndex].alert(_alert);
                } else {
                    this.extend(childEntry => {
                        childEntry.alert(_alert);
                    });
                }
            });
            return;
        }
        const _alert = super.alert();
        _alert.details = this.childEntries.filter(entry => entry).map(entry => entry.alert());
        return _alert;
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
        return !(entries.some(item => _isTypeObject(item) || (item + '').length > widgetLineContentLengthLimit));
    }

    define(jsonSchema, ownerWidget = null) {
        super.define(...arguments);
        if (this.schema.autoExtend !== false) {
            this.extend();
        }
    }
    
}

/**
 * @Enum Controller
 */
export const _Enum = __Enum => class extends _Root(__Enum) {

    constructor() {
        super();
        Observer.set(this, 'enumEntries', Observer.proxy([]));
        Observer.observe(this.enumEntries, mutations => {
            mutations.forEach(m => {
                if (m.name === 'length') return;
                if (m.type === 'set') {
                    if (m.isUpdate && m.oldValue && this.enumEntries.indexOf(m.oldValue) === -1) {
                        this.execNodeRemoval(m.oldValue);
                    }
                    if (_isFunction(this.onNodeRemoval)) {
                        this.onNodeRemoval(m.value, () => {
                            const i = this.enumEntries.indexOf(m.value);
                            if (i > -1) {
                                this.enumEntries.splice(i, 1);
                            }
                        });
                    }
                }
                if (m.type === 'deleteProperty') {
                    if (this.enumEntries.indexOf(m.oldValue) === -1) {
                        this.execNodeRemoval(m.oldValue);
                    }
                }
            });
        });
    }

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

    define(jsonSchema, ownerWidget = null) {
        // Enums can be any type
        const schemaName = this.constructor.getSchemaName(jsonSchema.type);
        this.enumEntries.splice(0);
        super.define(new (Schemas[schemaName]())(jsonSchema), ownerWidget);
        // -------------
        // Fetch items...
        // -------------
        const runSchemaEnum = (enumValues, enumNames) => {
            const entries = enumValues.map((value, i) => ({ value, label: (enumNames || {})[i] }));
            this.enumerate(entries, 1);
        };
        const runSchemaEnumFetch = remoteFetch => {
            this.enumFetching = this.remoteAction(remoteFetch.method || 'get', remoteFetch.url, {
                headers: { accept: 'application/json' }
            }).then(res => res.ok ? res.json() : Promise.reject({ message: res.statusText })).then(res => {
                var _entries = !_isArray(res.data) ? [] : res.data.map(entry => (_isObject(entry) ? {
                    value: 'value' in entry ? entry.value : entry.id,
                    label: 'label' in entry ? entry.label : entry.title,
                } : {
                    value: entry,
                }));
                this.enumerate(_entries, remoteFetch.url);
            });
        };
        // -------------
        // Mine items...
        // -------------
        if (this.schema.remoteFetch) {
            runSchemaEnumFetch(this.schema.remoteFetch);
            Observer.observe(this.schema, 'remoteFetch', () => {
                runSchemaEnumFetch(this.schema.remoteFetch);
            }, { subtree: true });
        } else if (this.schema.enum) {
            runSchemaEnum(this.schema.enum, this.schema.enumNames);
            Observer.observe(this.schema, [['enum'], ['enumNames']], () => {
                runSchemaEnum(this.schema.enum, this.schema.enumNames);
            });
        } else if (_arrFrom(this.schema.type || 'string').includes('array')) {
            const entries = [];
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
            this.enumerate(entries, 2);
        }
    }

    deriveEnumEntry(enumData, index) {}

    enumerate(entries, clearByTag = null) {
        if (_arrFrom(this.schema.type).includes('null')) {
            entries = [{ value: null, label: this.attrs.placeholder }].concat(entries);
        }
        if (clearByTag) {
            if (clearByTag === true) {
                this.enumEntries.splice(0);
            } else {
                this.enumEntries.filter(entry => _intersect(_arrFrom(entry.enumTag), _arrFrom(clearByTag)).length).forEach(entry => {
                    const index = this.enumEntries.indexOf(entry);
                    if (index > -1) {
                        this.enumEntries.splice(index, 1);
                    }
                });
            }
        }
        this.enumEntries.push(...entries.map((entry, i) => {
            entry = this.deriveEnumEntry(entry, i);
            if (clearByTag) {
                entry.enumTag = clearByTag;
            }
            return entry;
        }));
    }

    json(data = []) {
        if (arguments.length) {
            if (!_isArray(data)) {
                if (this.attrs.multiple)
                    throw new Error(`Data must be a valid JSON array.`);
                data = [ data ];
            }
            const runSelect = () => {
                this.enumEntries.forEach(entry => {
                    entry.selected = false;
                    data.forEach(value => {
                        if (entry.value === value + '') {
                            entry.selected = true;
                        }
                    });
                });
            };
            if (this.enumFetching) {
                this.enumFetching.then(runSelect);
            } else {
                runSelect();
            }
            return;
        }
        const selected = this.enumEntries.filter(entry => entry.selected).map(entry => entry.value);
        return this.attrs.multiple ? selected : selected[0];
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
        } else if (!jsonSchema.remoteFetch) {
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
        return !(entries.some(item => _isTypeObject(item) || (item + '').length > widgetLineContentLengthLimit));
    }

}

/**
 * @File Controller
 */
export const _File = __File => class extends _Root(__File) {

    constructor() {
        super();
        Observer.set(this, 'filesList', Observer.proxy([]));
        Observer.set(this, 'fallbackFilesList', Observer.proxy([]));
        Observer.observe(this.filesList, mutations => {
            mutations.forEach(m => {
                if (m.name === 'length') return;
                if (m.type === 'set') {
                    if (m.isUpdate && m.oldValue && this.filesList.indexOf(m.oldValue) === -1) {
                        this.execNodeRemoval(m.oldValue);
                    }
                    if (_isFunction(this.onNodeRemoval)) {
                        this.onNodeRemoval(m.value, () => {
                            const i = this.filesList.indexOf(m.value);
                            if (i > -1) {
                                this.filesList.splice(i, 1);
                            }
                        });
                    }
                }
                if (m.type === 'deleteProperty') {
                    if (this.filesList.indexOf(m.oldValue) === -1) {
                        this.execNodeRemoval(m.oldValue);
                    }
                }
            });
        });
    }

    static testSchema(jsonSchema) {
        const _isFileSchema = _jsonSchema => {
            const schemaType = _arrFrom(_jsonSchema.type || 'string');
            return (schemaType.includes('string') && (_isFileUpload(_jsonSchema) || (_jsonSchema.contentMediaType && !_isTextMediaType(_jsonSchema.contentMediaType))));
        };
        return _isFileSchema(jsonSchema) || (
            _arrFrom(jsonSchema.type).includes('array') && jsonSchema.uniqueItems && _isEmpty(jsonSchema.prefixItems) && _isFileSchema(jsonSchema.items || {})
        );
    }

    define(jsonSchema, ownerWidget = null) {
        const schemaType = _arrFrom(jsonSchema.type);
        const $schema = schemaType.includes('array') ? Schemas._Array() : Schemas._String();
        super.define(new $schema(jsonSchema), ownerWidget);
        this.filesList.splice(0);
        this.attrs.type = 'file';
        if (schemaType.includes('array')) {
            this.attrs.name += '[]';
            this.attrs.multiple = true;
        }
        if (this.schema.contentMediaType || (this.schema.items && this.schema.items.contentMediaType)) {
            this.attrs.accept = this.schema.contentMediaType || this.schema.items.contentMediaType;
        }
    }

    deriveFileEntry(fileData, key) {}

    populate(filesData, clearByTag = null) {
        if (clearByTag) {
            if (clearByTag === true) {
                this.filesList.splice(0);
            } else {
                this.filesList.filter(entry => _intersect(_arrFrom(entry.enumTag), _arrFrom(clearByTag)).length).forEach(entry => {
                    const index = this.filesList.indexOf(entry);
                    if (index > -1) {
                        // Don't remove just yet (; people are listening) until we figure out if this
                        // should only be a transition to this.fallbackFilesList
                        if (index > -1 && _intersect(_arrFrom(entry.enumTag), [ 1, 2 ]).length === 2) {
                            this.fallbackFilesList.push(this.filesList[index]);
                        }
                        this.filesList.splice(index, 1); // Remove only now
                    }
                });
            }
        }
        if ((!filesData || !filesData.length) && (!this.filesList.length || !this.filesList[0]) && this.fallbackFilesList.length) {
            const _enumTag = this.fallbackFilesList[0].enumTag;
            this.populate(this.fallbackFilesList.splice(0).map(_entry => ({ file: _entry.file })), _enumTag);
        }
        this.filesList.push(...filesData.map((fileData, i) => {
            var entry = this.deriveFileEntry(fileData, i, clearByTag);
            if (clearByTag !== null) {
                entry.enumTag = clearByTag;
            }
            return entry;
        }));
    }

    execNodeRemoval(node, confirm = null) {
        if (!confirm) {
            confirm = (msg, done) => done();
        }
        const name = 'file';
        if (this.schema.remoteDelete && this.fallbackFilesList.indexOf(node) === -1) {

            var value = node.file;
            if (value && !_isTypeObject(value)) {
                var deleteUrl = this.schema.remoteDelete.url.replace(/\{value\}/g, value);
                confirm(`Remove ${name} (and delete from your account)?`, () => {
                    return this.remoteAction(this.schema.remoteDelete.method || 'delete', deleteUrl).then(res => {
                        if (res.ok) {
                            super.execNodeRemoval(node);
                        }
                        return res;
                    });
                });
                return;
            }
        }
        confirm(`Remove ${name}?`, async () => {
            super.execNodeRemoval(node);
        });
    }

    json(files = []) {
        if (arguments.length) {
            if (!_isArray(files)) {
                if (this.attrs.multiple)
                    throw new Error(`Data must be a valid JSON array.`);
                files = [ files ];
            }
            this.populate(files.filter(file => file).map(file => ({ file })), [ 1, 2 ]);
            return;
        }
        const uploads = this.filesList.filter(entry => _isObject(entry.file)).map(entry => entry.file);
        return this.attrs.multiple ? uploads : uploads[0];
    }

};

/**
 * @InputRoot Base Controller
 */
export const _Input = __Input => class extends _Root(__Input) {

    define(jsonSchema, ownerWidget = null) {
        super.define(...arguments);
        if (!_isUndefined(this.schema.default) || this.schema.examples) {
            this.attrs.placeholder = `E.g.: ${!_isUndefined(this.schema.default) ? this.schema.default : this.schema.examples[0]}`;
        }
        if ('const' in this.schema || (this.schema.enum || []).length === 1) {
            this.attrs.value = 'const' in this.schema ? this.schema.const : this.schema.enum[0];
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
            Math.max(jsonSchema.maxLength || 0, jsonSchema.minLength || 0) >= 1024
        ));
    }

    define(jsonSchema, ownerWidget = null) {
        super.define(new (Schemas._String())(jsonSchema), ownerWidget);
    }

};

/**
 * @Input Controller
 */
export const _Text = __Text => class extends _Input(__Text) {
        
    static testSchema(jsonSchema) {
        return _arrFrom(jsonSchema.type || 'string').includes('string');
    }

    define(jsonSchema, ownerWidget = null) {
        super.define(new (Schemas._String())(jsonSchema), ownerWidget);
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

    define(jsonSchema, ownerWidget = null) {
        super.define(new (Schemas._Number())(jsonSchema), ownerWidget);
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

    define(jsonSchema, ownerWidget = null) {
        super.define(new (Schemas._Boolean())(jsonSchema), ownerWidget);
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

/**
 * @Root Base Controller
 */
export const _ItemScope = __ItemScope => class extends (__ItemScope || class {}) {

    define(schema, ownerWidget = null) {
        super.define(...arguments);
        const setItemIndex = () => {
            if ((this.attrs.index || this.attrs.index === 0) && this.childEntries && this.schema.indexProperty && this.childEntries[this.schema.indexProperty]) {
                this.childEntries[this.schema.indexProperty].json(this.attrs.index);
            }
        };
        setItemIndex();
        Observer.observe(this.attrs, 'index', setItemIndex);
    }
    
}