
/**
 * @imports
 */
import _each from '@webqit/util/obj/each.js';
import _beforeLast from '@webqit/util/str/beforeLast.js';
import _isString from '@webqit/util/js/isString.js';
import _isObject from '@webqit/util/js/isObject.js';
import _isArray from '@webqit/util/js/isArray.js';
import _arrFrom from '@webqit/util/arr/from.js';
import DOMInit from '@webqit/browser-pie/src/dom/index.js';

/**
 * Returns an array of Element object(s).
 *
 * @param Array|Element els
 * 
 * @return Array
 */
export function getEls(els) {
    const window = getPlayUIGlobal.call(this, 'window');
    var _els = els;
    if (_isString(els)) {
        _els = els.trim().startsWith('<') 
            ? [getPlayUIGlobal.call(this).el(els)] 
            : _arrFrom(window.document.querySelectorAll(els));
    } else {
        _els = _arrFrom(els, false);
    }
    if (!_els.length) {
        _els = [window.document.createElement('div')];
    }
    return _els;
}

/**
 * Returns an array of Element object(s).
 *
 * @param Array|Element els
 * 
 * @return Array
 */
export function getPlayUIGlobal(objectName) {
    var _window, thisContext = _isObject(this) ? this : {};
    if (thisContext.window) {
        _window = thisContext.window;
    } else if (typeof window !== 'undefined') {
        _window = window;
    }
    const DOM = DOMInit(_window);
    if (!objectName) {
        return DOM;
    }
    if (DOM[objectName]) {
        return DOM[objectName];
    }
    if (_window.WQ && _window.WQ[objectName]) {
        return _window.WQ[objectName];
    }
    throw new Error(`Play UI: ${objectName} not found in scope.`);
}

/**
 * Create a prototyper.
 *
 * @param object modules
 * @param int depth
 * @param object thisContext
 * 
 * @return void
 */
export function build(modules, depth = 0, thisContext = {}, $ = null) {
    // -----------
    if (!$) {
        $ = function(els) {
            if (!(this instanceof $)) {
                return new $(els);
            }
            Object.defineProperty(this, 'els', {get: function() {
                return els;
            }});
        };
    }
    // -----------
    _each(modules, (name, fn) => {
        if (depth) {
            build(modules[name], depth - 1, thisContext, $);
        } else {
            const instanceFn = function(...args) {
                var ret = fn.call(thisContext, this.els, ...args);
                if (ret instanceof Promise) {
                    return ret.then(_ret => _ret === thisContext ? this : _ret);
                }
                return ret === thisContext ? this : ret;
            };
            $.prototype[name] = instanceFn;
            // Create short form
            if (name.endsWith('Sync') || name.endsWith('Async')) {
                if (thisContext.PlayUISyncIsDefault && name.endsWith('Sync')) {
                    name = _beforeLast(name, 'Sync');
                } else if (!thisContext.PlayUISyncIsDefault && name.endsWith('Async')) {
                    name = _beforeLast(name, 'Async');
                }
                // Add to prototype now
                $.prototype[name] = instanceFn;
            }
        }
    });
    // -----------
    return $;
}