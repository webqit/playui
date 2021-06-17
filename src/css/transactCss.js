
/**
 * @imports
 */
import _isObject from '@webqit/util/js/isObject.js';
import inlineCss from './inlineCss.js';
import cssSync from './cssSync.js';
import cssAsync from './cssAsync.js';
import { getEls } from '../util.js';

/**
 * Applies some CSS within a transaction, gets computed values for use before rolling back.
 * If a callback is provided, it synces the entire operation with Reflow's normal read/write cycles.
 *
 * @param Array|Element		els
 * @param string|object		nameOrProps
 * @param string|number		val
 * @param function			readCallback
 * @param bool				asyncMode
 *
 * @return Promise
 */
export default async function(els, nameOrProps, val = null, readCallback = null, asyncMode = false) {
    var propsToRead = _isObject(nameOrProps) ? Object.keys(nameOrProps) : [nameOrProps];
    readCallback = _isObject(nameOrProps) ? val : readCallback;
    const cssModule = asyncMode ? cssAsync : cssSync;
    var _el = getEls.call(this, els)[0];
    // -------------
    var inlineSavepoint = inlineCss.call(this, els, propsToRead);
    await cssModule.call(this, els, nameOrProps, val);
    var rendering;
    if (readCallback) {
        var _rendering = readCallback(_el);
        rendering = propsToRead.reduce((rulesObj, prop) => {
            rulesObj[prop] = _rendering[prop];
            return rulesObj;
        }, {});
        if (!_isObject(nameOrProps)) {
            rendering = rendering[nameOrProps];
        }
    } else {
        rendering = cssModule.call(this, els, propsToRead);
    }
    // We return the rendering in a promise
    await cssModule.call(this, els, inlineSavepoint);
    return rendering;
}