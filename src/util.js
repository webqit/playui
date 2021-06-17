
/**
 * @imports
 */
import _each from '@webqit/util/obj/each.js';
import _beforeLast from '@webqit/util/str/beforeLast.js';
import domInit, { query } from '@webqit/browser-pie/src/dom/index.js';

/**
 * Returns an array of Element object(s).
 *
 * @param Array|Element els
 * 
 * @return Array
 */
export function getEls(els) {
    return query.call(this, els);
}

/**
 * Returns an array of Element object(s).
 *
 * @param Array|Element els
 * 
 * @return Array
 */
export function getPlayUIGlobal(objectName) {
    const WebQit = domInit.call(this);
    if (!objectName) {
        return WebQit;
    }
    if (WebQit[objectName]) {
        return WebQit[objectName];
    }
    if (WebQit.DOM && WebQit.DOM[objectName]) {
        return WebQit.DOM[objectName];
    }
    throw new Error(`Play UI: ${objectName} not found in scope.`);
}

/**
 * Returns a PlayUI-specific object embedded on an element.
 *
 * @param Element element
 * 
 * @return Object
 */
export function getPlayUIStub(element) {
    var webqitStub, playUiStub, webqitStubSymbol = Symbol.for('.webqit');
    if (!(webqitStub = element[webqitStubSymbol])) {
        Object.defineProperty(element, webqitStubSymbol, {value: {}, enumerable: false});
    }
    if (!(playUiStub = webqitStub.oohtml)) {
        playUiStub = {};
        webqitStub.playUi = playUiStub;
    }
    return playUiStub;
}

/**
 * Create a prototyper.
 *
 * @param object modules
 * @param int depth
 * @param object thisContext
 * @param object params
 * 
 * @return void
 */
export function build(modules, depth = 0, thisContext = {}, params = {}, $ = null) {
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
            build(modules[name], depth - 1, thisContext, params, $);
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
                if (params.defaultAsync && name.endsWith('Sync')) {
                    name = _beforeLast(name, 'Sync');
                } else if (!params.defaultAsync && name.endsWith('Async')) {
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