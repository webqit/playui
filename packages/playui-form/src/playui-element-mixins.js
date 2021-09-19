
/**
 * @imports
 */
import Observer from '@webqit/observer';
import { _from as _arrFrom } from '@webqit/util/arr/index.js';
import { _toTitle } from '@webqit/util/str/index.js';
import * as Roots from './playui-mixins.js';

/**
 * ---------------------------
 * Root Elements
 * ---------------------------
 */

/**
 * @Root Element
 * @extends __Root
 */
export const _Root = __Root => class extends (__Root || HTMLElement) {

    static get subscriptBlocks() {
        return [ 'renderBasic', 'render' ];
    }

    renderBasic() {
        //if (typeof $ === 'undefined') return;
        if (this.schema.title && this.namespace.title) {
            $(this.namespace.title).html(this.schema.title);
        }
        if (this.schema.col) {
            $(this).class({
                ['col-' + this.schema.col]: true,
                'col-12': false,
            });
        } else {
            $(this).class('col-12', true);
        }
    }

    render() {}

};

/**
 * @ParentRoot Element
 * @extends _Root() -> __ParentRoot
 */
export const _ParentRoot = __ParentRoot => class extends _Root(__ParentRoot) {

    deriveChildWidget(childSchema) {
        if (!this.template) return;
        return Reflect.ownKeys(this.template.exports).map(key => this.template.exports[key][0]).reduce((match, item) => {
            if (match) return match;
            const constructor = item.hasAttribute('is') 
                ? customElements.get(item.getAttribute('is'))
                : customElements.get(item.localName);
            return constructor && constructor.testSchema(childSchema) ? item : null;
        }, null);
    }
    
    renderChildWidget(childWidget, childSchema, disconnectedCallback = null) {
        if (!childWidget) return;
        // ------------
        childWidget = childWidget.cloneNode(true);
        if (this.namespace.content) {
            this.namespace.content.append(childWidget);
        } else {
            this.append(childWidget);
        }
        // ------------
        try {
            childWidget.setSchema(childSchema, this);
        } catch(e) {
            console.warn(`Error calling element.setSchema();`, e, this);
        }
        if (disconnectedCallback) {
            //this.bindDisconnectedCallback(disconnectedCallback);
        }
        return childWidget;
    }

};

/**
 * @Collection Element
 * @extends _ParentRoot() -> Roots._Collection() -> __Collection
 */
export const _Collection = __Collection => class extends _ParentRoot(Roots._Collection(__Collection || HTMLElement)) {
};

/**
 * @MultipleRoot Element
 * @extends _ParentRoot() -> __MultipleRoot
 */
export const _MultipleRoot = __MultipleRoot => class extends _ParentRoot(__MultipleRoot) {
};

/**
 * @Multiple Element
 * @extends _MultipleRoot() -> Roots._Multiple() -> __Multiple
 */
export const _Multiple = __Multiple => class extends _MultipleRoot(Roots._Multiple(__Multiple || HTMLElement)) {
};

/**
 * @Multiple2 Element
 * @extends _MultipleRoot() -> Roots._Multiple2() -> __Multiple2
 */
export const _Multiple2 = __Multiple2 => class extends _MultipleRoot(Roots._Multiple2(__Multiple2 || HTMLElement)) {

    render() {
        if (this.namespace.input && this.attrs.name) {
            $(this.namespace.input).attr(this.attrs);
        }
    }

    extend(callback = null) {
        if (this.entries.length && !this.entries[this.entries.length - 1].namespace.input.value) {
            return;
        }
        return super.extend(callback);
    }

};

/**
 * @EnumRoot Element
 * @extends _Root() -> __EnumRoot
 */
export const _EnumRoot = __EnumRoot => class extends _Root(__EnumRoot) {

    deriveItemWidget(entry, itemIndex) {
        if (!this.template) {
            if (this.namespace.input instanceof HTMLSelectElement) {
                return document.createElement('option');
            }
        }
        return Reflect.ownKeys(this.template.exports).map(key => this.template.exports[key][0]).reduce((match, item) => {
            if (match) return match;
            const constructor = item.hasAttribute('is') 
                ? customElements.get(item.getAttribute('is'))
                : customElements.get(item.localName);
            return constructor && constructor.testSchema(this.schema, entry) ? item : null;
        }, null);
    }
    
    renderItemWidget(enumWidget, entry, itemIndex, disconnectedCallback = null) {
        if (!enumWidget) return;
        // ------------
        enumWidget = enumWidget.cloneNode(true);
        if (this.namespace.input instanceof HTMLSelectElement) {
            this.namespace.input.options.add(enumWidget);
            enumWidget.setAttribute('label', entry.label || _toTitle(entry.value));
            enumWidget.value = entry.value;
            enumWidget.selected = entry.selected;
        } else {
            this.namespace.input.append(enumWidget);
            enumWidget.setAttribute('data-index', itemIndex);
        }
        // ------------
        if (disconnectedCallback) {
            //this.bindDisconnectedCallback(disconnectedCallback);
        }
        return enumWidget;
    }

    json(data = null) {
        if (arguments.length) {
            if (this.namespace.input instanceof HTMLSelectElement) {
                if (this.attrs.multiple) {
                    if (!_isArray(data)) throw new Error(`Data must be a valid JSON array.`);
                    Array.from(this.namespace.input.options).forEach(option => {
                        option.selected = false;
                        data.forEach(value => {
                            if (option.value === value) {
                                option.selected = true;
                            }
                        });
                    });
                } else {
                    this.namespace.input.value = data;
                }
                return;
            }
            if (this.attrs.multiple) {
            } else {
            }
            return;
        }
        // ------------------
        if (this.namespace.input instanceof HTMLSelectElement) {
            return this.attrs.multiple ? this.namespace.input.selectedOptions : this.namespace.input.value;
        }
        return this.attrs.multiple ? [] : this.namespace.input.value;
    }

    render() {
        if (this.namespace.input && this.attrs.name) {
            $(this.namespace.input).attr(this.attrs);
        }
    }

};

/**
 * @Enum Element
 * @extends _EnumRoot() -> Roots._Enum() -> __Enum
 */
export const _Enum = __Enum => class extends _EnumRoot(Roots._Enum(__Enum || HTMLElement)) {
}

/**
 * @Enum2 Element
 * @extends _EnumRoot() -> Roots._Enum2() -> __Enum2
 */
export const _Enum2 = __Enum2 => class extends _EnumRoot(Roots._Enum2(__Enum2 || HTMLElement)) {
}

/**
 * @File Element
 * @extends _Root() -> Roots._File() -> __FileRoot
 */
export const _File = __File => class extends _Root(Roots._File(__File || HTMLElement)) {

    setSchema(jsonSchema, parentwidget = null) {
        super.setSchema(...arguments);
        const schemaType = _arrFrom(this.schema.type);
        if (schemaType.includes('array')) {
            this.attrs.name += '[]';
        }
    }

    constructor() {
        super();
        this._dataTransfer = new DataTransfer;
        Observer.observe(this.filesList, mutations => {
            mutations.forEach(m => {
                if (m.type === 'deleteProperty' && m.oldValue.previewElement) m.oldValue.previewElement.remove();
                if (m.type === 'set' && m.isUpdate && m.oldValue && m.oldValue.previewElement) m.oldValue.previewElement.remove();
            });
        });
        // ------------------
        // On-direct choosing
        // ------------------
        this.addEventListener('change', e => {
            if (this.namespace.dropArea) {
                this.addFiles(e.target.files, true);
            }
        });
        this._handlerDrag = e => {
            if (e.type === 'dragover' || e.type === 'dragenter') {
                if (this.state) {
                    this.state.dragging = true;
                }
            } else if (e.type === 'dragleave' || e.type === 'dragend' || e.type === 'drop') {
                e.preventDefault();
                if (this.state) {
                    this.state.dragging = false;
                }
                if (e.type === 'drop') {
                    this.addFiles(e.dataTransfer.files);
                }
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.namespace.dropArea) {
            // On drag-and-drop
            [ 'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop' ].forEach(eventName => {
                this.namespace.dropArea.removeEventListener(eventName, this._handlerDrag);
                this.namespace.dropArea.addEventListener(eventName, this._handlerDrag);
            });
        }
    }

    addFiles(files, isDirectSelection = false) {
        const filesListAdd = file => {
            if (!file) return;
            const entry = { file, isDirectSelection, remove: () => {
                this._dataTransfer.items.remove(file);
                this.filesList.splice(this.filesList.indexOf(entry), 1);
            } };
            this._dataTransfer.items.add(file);
            this.filesList.push(entry);
            // -----------------------
            const itemIndex = this.filesList.length - 1;
            entry.previewElement = this.renderPreviewElement(this.derivePreviewElement(file, itemIndex), file, itemIndex, () => {
                entry.remove();
            });
        };
        if (this.schema.multiple) {
            // Add new files each time
            if (isDirectSelection) {
                this.filesList
                    .filter(entry => entry.isDirectSelection)
                    .forEach(entry => entry.remove());
            }
            for (let i = 0; i < files.length; i++) {
                filesListAdd(files[i]);
            }
        } else {
            // Clear existing
            this._dataTransfer.items.clear();
            this.filesList.splice(0);
            filesListAdd(files[0]);
        }
        if (this.namespace.input) {
            // Assign the files to the input element
            this.namespace.input.files = this._dataTransfer.files;
        }
    }

    derivePreview(file) {
        // Show thumnails
        var desc = `${file.name}: ${file.size / 1024}KB`;
        var revokeURL = el => window.URL.revokeObjectURL(el.src);
        if (/^image\//.test(file.type)) {
            var img = document.createElement('img');
            img.onload = e => { revokeURL(img); };
            img.src = window.URL.createObjectURL(file);
            return { el: img, type:'image', mime: file.type, desc, };
        }
        if (/^video\//.test(file.type)) {
            var media = document.createElement('video');
            media.onloadstart/*canplay*/ = e => { revokeURL(media); media.play(); };
            media.src = window.URL.createObjectURL(file);
            media.muted = true;
            return { el: media, type: 'video', mime: file.type, desc, };
        }
        const el = document.createElement('i');
        el.classList.add('bi');
        var type = 'file';
        if (/^audio\//.test(file.type)) {
            type = 'audio';
        } else if (/msword|ms-word|wordprocessing/.test(file.type)) {
            type = 'word';
        } else if (/powerpoint|presentation/.test(file.type)) {
            type = 'powerpoint';
        } else if (/excel|spreadsheet/.test(file.type)) {
            type = 'excel';
        } else if (/^text\//.test(file.type)) {
            type = 'text';
        } else if (/\/pdf/.test(file.type)) {
            type = 'pdf';
        } else if (/\/zip/.test(file.type)) {
            type = 'zip';
        }
        el.classList.add('bi-file-' + type);
        return { el, type, mime: file.type, desc, };
    }

    derivePreviewElement(file, itemIndex) {
        if (!this.template) return;
        return (this.template.exports.default || [])[0];
    }    

    renderPreviewElement(previewElement, file, itemIndex, disconnectedCallback = null) {
        const previewData = this.derivePreview(file);
        if (previewElement) {
            previewElement = previewElement.cloneNode(true);
            previewElement.append(previewData.el);
        } else {
            previewElement = previewData.el;
        }
        // ------------
        if (this.namespace.preview) {
            this.namespace.preview.append(previewElement);
        } else {
            this.append(previewElement);
        }
        // ------------
        if (disconnectedCallback) {
            //this.bindDisconnectedCallback(disconnectedCallback);
        }
        return previewElement;
    }

    json(data = null) {
        if (arguments.length) {
            this.filesList.forEach(entry => {
                entry.remove();
            });
            if (this.attrs.multiple) {
                if (!_isArray(data)) throw new Error(`Data must be a valid JSON array.`);
            } else {
                data = [ data ];
            }
            this.addFiles(data);
            return;
        }
        // ------------------
        return this.attrs.multiple 
            ? this.namespace.input.files 
            : this.namespace.input.files[0];
    }

    render() {
        if (this.namespace.input && (this.attrs.type || this.attrs.name)) {
            $(this.namespace.input).attr(this.attrs);
        }
    }

};

/**
 * @Input Element
 * @extends _Root() -> __Input
 */
export const _Input = __Input => class extends _Root(__Input) {

    json(data = null) {
        if (arguments.length) {
            this.namespace.input.value = data;
            return;
        }
        return this.namespace.input.value;
    }

    render() {
        if (this.namespace.input && (this.attrs.type || this.attrs.name)) {
            $(this.namespace.input).attr(this.attrs);
        }
    }

};

/**
 * @Editor Element
 * @extends _Input() -> Roots._Editor() -> __Editor
 */
export const _Editor = __Editor => class extends _Input(Roots._Editor(__Editor || HTMLElement)) {
};

/**
 * @Text Element
 * @extends _Input() -> Roots._Text() -> __Text
 */
export const _Text = __Text => class extends _Input(Roots._Text(__Text || HTMLElement)) {
};

/**
 * @Number Element
 * @extends _Input() -> Roots._Number() -> __Number
 */
export const _Number = __Number => class extends _Input(Roots._Number(__Number || HTMLElement)) {
};

/**
 * @State Element
 * @extends _Input() -> Roots._State() -> __State
 */
export const _State = __State => class extends _Input(Roots._State(__State || HTMLElement)) {

    json(data = null) {
        if (arguments.length) {
            this.namespace.input.value = data;
            return;
        }
        return this.namespace.input.checked ? this.namespace.input.value : null;
    }

};
