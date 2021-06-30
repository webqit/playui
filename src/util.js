
/**
 * @imports
 */
import _set from '@webqit/util/obj/set.js';
import _each from '@webqit/util/obj/each.js';
import _isClass from '@webqit/util/js/isClass.js';
import _isArray from '@webqit/util/js/isArray.js';
import _isObject from '@webqit/util/js/isObject.js';
import _beforeLast from '@webqit/util/str/beforeLast.js';
import domInit, { queryAll } from '@webqit/browser-pie/src/dom/index.js';

/**
 * Returns an array of Element object(s).
 *
 * @param Array|Element input
 * @param Element|Document queryContext
 * 
 * @return Array
 */
export function getEls(input, queryContext = null) {
    if (_isObject(input) && input.toArray) {
        return input.toArray();
    }
    return queryAll.call(this, input, queryContext);
}

/**
 * Returns an array of Element object(s).
 *
 * @param String objectName
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
        webqitStub = {};
        Object.defineProperty(element, webqitStubSymbol, {value: webqitStub, enumerable: false});
    }
    if (!(playUiStub = webqitStub.playUi)) {
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
export function build(modules, depth = 0, thisContext = {}, params = {}, $ = null, _namespace = []) {
    // -----------
    if (!$) {
        $ = function(input, queryContext = null) {
            if (!(this instanceof $)) {
                return new $(input, queryContext);
            }
            Object.defineProperty(this, 'input', {get: function() {
                return input;
            }});
            var inputElements;
            Object.defineProperty(this, 'toArray', {value: function() {
                if (!inputElements) {
                    inputElements = getEls.call(thisContext, input, queryContext);
                }
                return inputElements;
            }});
            Object.defineProperty(this, 'each', {value: function(callback) {
                this.toArray().forEach(callback);
                return this;
            }});
        };
    }
    // -----------
    _each(modules, (name, fn) => {
        if (depth || ['classes', 'utils'].includes(name)) {
            build(modules[name], depth - 1, thisContext, params, $, _namespace.concat(name));
        } else if (_isClass(fn) || name.substr(0, 1).toLowerCase() !== name.substr(0, 1)) {
            // As static members
            _set($, _namespace.concat(name), fn);
        } else {

            // Create instance methods
            if (!['classes', 'utils'].includes(_namespace[_namespace.length - 1])) {
                // As instance methods
                const $fn2 = function(...args) {
                    var ret = fn.call(thisContext, this.toArray(), ...args);
                    if (ret instanceof Promise) {
                        return ret.then(_ret => _ret === thisContext || (_isArray(_ret) && _ret[0] === thisContext) ? this : _ret);
                    }
                    return ret === thisContext ? this : ret;
                };

                $.prototype[name] = $fn2;
                // Create short form
                if (name.endsWith('Sync') || name.endsWith('Async')) {
                    var nameUnprefixed;
                    if (params.defaultAsync && name.endsWith('Async')) {
                        nameUnprefixed = _beforeLast(name, 'Async');
                    } else if (!params.defaultAsync && name.endsWith('Sync')) {
                        nameUnprefixed = _beforeLast(name, 'Sync');
                    }
                    // Add to prototype now
                    $.prototype[nameUnprefixed] = $fn2;
                }
            }

            // As static methods
            // We preserve the incoming context so as to return it
            _set($, _namespace.concat(name), function(...args) {
                var ret = fn.call(thisContext, ...args);
                if (ret instanceof Promise) {
                    return ret.then(_ret => _ret === thisContext || (_isArray(_ret) && _ret[0] === thisContext) ? this : _ret);
                }
                return ret === thisContext ? this : ret;
            });

        }
    });
    // -----------
    return $;
}