
/**
 * @imports
 */
import Observer from '@webqit/observer';
import { _from as _arrFrom, _intersect } from '@webqit/util/arr/index.js';
import { _isString, _isNumeric, _isTypeObject } from '@webqit/util/js/index.js';
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

    constructor() {
        super();
        const mutationObserver = new MutationObserver(entries => {
            entries.forEach(entry => {
                entry.removedNodes.forEach(node => {
                    if (this.nodeRemovalListeners && this.nodeRemovalListeners.has(node)) {
                        this.nodeRemovalListeners.get(node).forEach(callback => callback());
                    }
                });
            });
        });
        mutationObserver.observe(this, { subtree: true, childList: true });
    }

    async remoteAction(method, url, options = {}) {
        this.state.remoteAction = method;
        this.state.remoteActionError = '';
        return fetch(url, { headers: { accept: 'application/json' }, ...options, method }).then(res => {
            this.state.remoteAction = false;
            return res;
        }).catch(e => {
            this.state.remoteAction = false;
            this.alert(e);
        });
    }

    static get subscriptBlocks() {
        return [ 'renderBasic', 'render' ];
    }

    renderBasic() {
        //if (typeof $ === 'undefined') return;
        if (this.schema.title && this.namespace.title) {
            $(this.namespace.title).html(this.schema.title);
        }
        if (this.schema.description && this.namespace.description) {
            $(this.namespace.description).html(this.schema.description);
        }
        if (this.schema.isRequired) {
            $(this).attr('data-required', true);
        }
        if (this.schema.col && this.schema.col !== 12) {
            $(this).class({
                ['col-' + this.schema.col]: true,
                'col-12': false,
            });
        } else {
            $(this).class('col-12', true);
        }
        if (this.schema.display === 'hidden') {
            $(this).class('overflow-hidden wt-0 ht-0 pd-0 mg-0', true);
        }
        $(this).attr('data-remote-action', this.state.remoteAction || false);
        $(this).attr('data-remote-action-error', this.state.remoteActionError || false);
        var message = this.state.alert ? this.state.alert.message : '';
        var type = this.state.alert ? this.state.alert.type : '';
        if (this.namespace.alert) {
            $(this.namespace.alert).html(message || '');
            $(this.namespace.alert).attr('data-type', type || false);
            if (message) {
                this.namespace.alert.focus();
            }
        }
    }

    render() {}

    alert() {
        const ret = super.alert(...arguments);
        this.renderBasic();
        return ret;
    }

};

/**
 * @ParentRoot Element
 * @extends _Root() -> __ParentRoot
 */
export const _ParentRoot = __ParentRoot => class extends _Root(__ParentRoot) {

    connectedCallback() {
        super.connectedCallback();
        if (this.namespace.adder) {
            this.adderAction = this.adderAction || (() => this.extend());
            this.namespace.adder.removeEventListener('click', this.adderAction);
            this.namespace.adder.addEventListener('click', this.adderAction);
        }
    }

    deriveChildEntry(childSchema, i) {
        if (!this.template) return;
        var childEntry = Reflect.ownKeys(this.template.exports).map(key => this.template.exports[key][0]).reduce((match, item) => {
            if (match) return match;
            const constructor = item.hasAttribute('is') 
                ? customElements.get(item.getAttribute('is'))
                : customElements.get(item.localName);
            return constructor && constructor.testSchema(childSchema) ? item : null;
        }, null);
        if (childEntry) {
            childEntry = childEntry.cloneNode(true);
            if (this.namespace.content) {
                this.namespace.content.append(childEntry);
            } else {
                this.append(childEntry);
            }
            // ------------
            try {
                childEntry.setSchema(childSchema, this);
                (childEntry.attrs || {}).index = i;
            } catch(e) {
                console.warn(`Error calling element.setSchema();`, e, this);
            }
        }
        return childEntry;
    }

};

/**
 * @Collection Element
 * @extends _ParentRoot() -> Roots._Collection() -> __Collection
 */
export const _Collection = __Collection => class extends _ParentRoot(Roots._Collection(__Collection || HTMLElement)) {

    get value() {
        if (this.schema.primaryKey && this.childEntries[this.schema.primaryKey]) {
            return this.childEntries[this.schema.primaryKey].json();
        }
    }
    
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

    constructor() {
        super();
        this.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                this.extend(childEntry => childEntry.namespace.input ? childEntry.namespace.input.focus() : null);
                e.preventDefault();
            }
        });
    }

    extend(callback = null) {
        if (this.childEntries.length && !this.childEntries[this.childEntries.length - 1].namespace.input.value) {
            return;
        }
        return super.extend(callback);
    }

    render() {
        if (this.namespace.input && this.attrs.name) {
            $(this.namespace.input).attr(this.attrs);
        }
    }

};

/**
 * @EnumRoot Element
 * @extends _Root() -> __EnumRoot
 */
export const _EnumRoot = __EnumRoot => class extends _Root(__EnumRoot) {

    deriveEnumEntry(entry, i) {
        var enumEntry;
        if (!this.template && this.namespace.input instanceof HTMLSelectElement) {
            enumEntry = document.createElement('option');
        } else {
            var _enumEntry = Reflect.ownKeys(this.template.exports).map(key => this.template.exports[key][0]).reduce((match, item) => {
                if (match) return match;
                const constructor = item.hasAttribute('is') 
                    ? customElements.get(item.getAttribute('is'))
                    : customElements.get(item.localName);
                return constructor && constructor.testSchema(this.schema, entry) ? item : null;
            }, null);
            if (_enumEntry) {
                enumEntry = _enumEntry.cloneNode(true);
            }
        }
        if (enumEntry) {
            if (this.namespace.input instanceof HTMLSelectElement) {
                this.namespace.input.options.add(enumEntry);
                enumEntry.setAttribute('label', entry.label || _toTitle(entry.value));
                enumEntry.value = entry.value;
                enumEntry.selected = entry.selected;
            } else {
                this.namespace.input.append(enumEntry);
                enumEntry.setAttribute('data-index', itemIndex);
            }
        }
        return enumEntry;
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

    constructor() {
        super();
        // ------------------
        // On-direct choosing
        // ------------------
        this.addEventListener('change', e => {
            if (this.namespace.dropArea) {
                this.populate(Array.from(e.target.files).map(file => ({ file })), 1);
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
                    this.populate(Array.from(e.dataTransfer.files).map(file => ({ file })));
                }
            }
        };
        Observer.observe(this.filesList, mutations => {
            if (mutations[0].name === 'length' || !this.namespace.input) return;
            const dataTransfer = new DataTransfer;
            this.filesList.map(entry => entry.file).filter(file => !_isString(file)).forEach(file => {
                dataTransfer.items.add(file);
            });
            // Assign the files to the input element
            this.namespace.input.files = dataTransfer.files;
            // Still keep the "required" attribute?
            if (this.schema.isRequired) {
                if (!this.namespace.input.files.length && this.filesList.length && this.filesList[0]/* IMPORTANT: item 0 may be "undefined" */) {
                    // Then there must be files added by link
                    this.namespace.input.removeAttribute('required');
                } else {
                    // Restore
                    this.namespace.input.setAttribute('required', true);
                }
            }
        });
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

    setSchema(jsonSchema, ownerWidget = null) {
        super.setSchema(...arguments);
        this.render();
    }

    deriveFileEntry(fileData, i, clearByTag = null) {
        if (!this.template) return;
        var childEntry = Reflect.ownKeys(this.template.exports).map(key => this.template.exports[key][0]).reduce((match, item) => {
            if (match) return match;
            const constructor = item.hasAttribute('is') 
                ? customElements.get(item.getAttribute('is'))
                : customElements.get(item.localName);
            return constructor && constructor.testFile(fileData) ? item : null;
        }, null);
        if (childEntry) {
            childEntry = childEntry.cloneNode(true);
            childEntry.file = fileData._file || fileData.file;
            if (_isString(fileData.file)) {
                const defaultInput = document.createElement('input');
                defaultInput.setAttribute('name', this.attrs.name);
                defaultInput.setAttribute('value', fileData.file);
                defaultInput.setAttribute('type', 'hidden');
                childEntry.append(defaultInput);
                childEntry.setAttribute('data-src', fileData.file);
                if (_intersect(_arrFrom(clearByTag), [ 1, 2 ]).length === 2 && !this.schema.remoteDelete) {
                    childEntry.setAttribute('data-isdefault', 'true');
                }
            }
            if (this.namespace.preview) {
                this.namespace.preview.append(childEntry);
            } else {
                this.append(childEntry);
            }
            // ------------
            try {
                childEntry.previewFile(fileData.file, this);
            } catch(e) {
                console.warn(`Error calling element.previewFile();`, e, this);
            }
        }
        return childEntry;
    }

    render() {
        if (this.namespace.input && (this.attrs.type || this.attrs.name)) {
            $(this.namespace.input).attr(this.attrs);
        }
    }

};

/**
 * @FilePreview Element
 * @extends __FilePreview
 */
export const _FilePreview = __FilePreview => class extends (__FilePreview || HTMLElement) {

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        if (this.namespace.deleter) {
            this.deleterAction = this.deleterAction || (() => {
                if (this.ownerWidget) {
                    this.ownerWidget.execNodeRemoval(this, (msg, done) => {
                        if (confirm(msg)) {
                            $(this).attr('data-deleting', true);
                            done().then(res => {
                                $(this).attr('data-deleting', false);
                                // This dry populate() should trigger restoration
                                // of fallbackFiles. (See this.ownerWidget.populate())
                                this.ownerWidget.populate([], [ 1, 2 ]);
                            });
                        }
                    });
                }
            });
            this.namespace.deleter.removeEventListener('click', this.deleterAction);
            this.namespace.deleter.addEventListener('click', this.deleterAction);
        }
    }

    static testFile(fileData) {
        return true;
    }

    async previewFile(file, ownerWidget) {
        this.ownerWidget = ownerWidget;
        if (_isString(file)) {
            const response = await fetch(file);
            const data = response.ok ? await response.blob() : '';
            file = new File([data], file.split('/').pop(), {
                type: response.headers.get('content-type') || 'application/octet-stream',
            });
        }
        // Show thumnails
        var desc = `${file.name}: ${file.size / 1024}KB`;
        var revokeURL = el => window.URL.revokeObjectURL(el.src);
        if (/^image\//.test(file.type)) {
            var img = document.createElement('img');
            img.onload = e => { revokeURL(img); };
            img.src = window.URL.createObjectURL(file);
            this.append(img);
            return;
        }
        if (/^video\//.test(file.type)) {
            var media = document.createElement('video');
            media.onloadstart/*canplay*/ = e => { revokeURL(media); media.play(); };
            media.src = window.URL.createObjectURL(file);
            media.muted = true;
            this.append(media);
            return;
        }
        const el = document.createElement('i');
        el.classList.add('bi');
        var type = 'file';
        if (/^audio\//.test(file.type)) {
            type = 'music';
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
        this.append(el);
        return;
    }

}

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
            this.namespace.input.checked = data === true || data + '' === this.namespace.input.value;
            return;
        }
        return this.namespace.input.checked ? this.namespace.input.value : null;
    }

};

/**
 * @ItemScope Element
 * @extends __ItemScope
 */
export const _ItemScope = __ItemScope => class extends Roots._ItemScope(__ItemScope || HTMLElement) {

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        if (this.namespace.deleter) {
            this.deleterAction = this.deleterAction || (() => {
                if (this.ownerWidget) {
                    this.ownerWidget.execNodeRemoval(this, (msg, done) => {
                        if (confirm(msg)) {
                            $(this).attr('data-deleting', true);
                            done().then(res => {
                                $(this).attr('data-deleting', false);
                            });
                        }
                    });
                }
            });
            this.namespace.deleter.removeEventListener('click', this.deleterAction);
            this.namespace.deleter.addEventListener('click', this.deleterAction);
        }
    }

};
