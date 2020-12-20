
/**
 * @imports
 */
import _each from '@webqit/util/obj/each.js';
import _beforeLast from '@webqit/util/str/beforeLast.js';
import _isString from '@webqit/util/js/isString.js';
import DOMInit from '@webqit/browser-pie/src/dom/index.js';

/**
 * The instantiable PlayUI function.
 *
 * @param Element|String el
 * 
 * @return this
 */
const $ = function(el) {
    if (!(this instanceof $)) {
        return new $(el);
    }
    this.__el = el;
};
export {
    $ as default,
}

/**
 * Create a prototyper.
 *
 * @param window window
 * @param object params
 * 
 * @return void
 */
export function build(window, modules, depth = 0, params = {}, target = $) {
    const DOM = DOMInit(window);
    if (!('el' in target.prototype)) {
        Object.defineProperty(target.prototype, 'el', {get: function() {
            if (_isString(this.__el)) {
                this.__el = DOM.el(this.__el);
            }
            return this.__el;
        }});
    }
    _each(modules, (name, fn) => {
        if (depth) {
            build(window, modules[name], depth - 1, params, target);
        } else {
            const instanceFn = function(...args) {
                return getReturn(this, fn.call(DOM, this.el || DOM.window.document.createElement('div'), ...args), params);
            };
            target.prototype[name] = instanceFn;
            // Create short form
            if (name.endsWith('Sync') || name.endsWith('Async')) {
                if (params.syncIsDefault && name.endsWith('Sync')) {
                    name = _beforeLast(name, 'Sync');
                } else if (!params.syncIsDefault && name.endsWith('Async')) {
                    name = _beforeLast(name, 'Async');
                }
                // Add to prototype now
                target.prototype[name] = instanceFn;
            }
        }
    });
    return target;
};
// --------
const getReturn = (instance, ret, params) => {
    if (params.el) {
        if (ret instanceof Promise) {
            return ret.then(_ret => _ret === instance.el ? instance : _ret);
        }
        return ret === instance.el ? instance : ret;
    }
    return ret;
};
