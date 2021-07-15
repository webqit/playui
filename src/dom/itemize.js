
/**
 * @_import
 */
import _isTypeObject from '@webqit/util/js/isTypeObject.js';
import _isFunction from '@webqit/util/js/isFunction.js';
import _isNumeric from '@webqit/util/js/isNumeric.js';
import _isEmpty from '@webqit/util/js/isEmpty.js';
import _isArray from '@webqit/util/js/isArray.js';
import _following from '@webqit/util/arr/following.js';
import _arrFrom from '@webqit/util/arr/from.js';
import _arrMid from '@webqit/util/arr/mid.js';
import _each from '@webqit/util/obj/each.js';
import { getPlayUIGlobal, getEls } from '../util.js';
import _internals from '@webqit/util/js/internals.js';

/**
 * Binds a (reactive) list context to the instance.
 * Childnodes will be automatically created/removed per key.
 *
 * @param Array|Element 		els
 * @param array 		        items
 * @param Object 		        params
 *
 * @return this
 */
export default function itemize(els, items, params = {}) {
    const window = getPlayUIGlobal.call(this, 'window');
    const Observer = getPlayUIGlobal.call(this, 'Observer');
    const Reflow = getPlayUIGlobal.call(this, 'reflow');
    const OOHTML = getPlayUIGlobal.call(this, 'OOHTML');
    const itemIndexAttribute = params.itemIndexAttribute || 'data-index';
    // -----------------
    const _set = (el, templateExportsObject, itemExportId, key, itemData, isUpdate) => {
        var itemEl;
        if (isUpdate && el.children.length) {
            itemEl = childSelector(el, '[' + itemIndexAttribute + '="' + key + '"]');
        } 
        if (!itemEl) {
            // --------------
            var exports;
            if (itemExportId) {
                exports = templateExportsObject.get(itemExportId);
            } else {
                exports = templateExportsObject.get(key);
                if (_isEmpty(exports) && _isNumeric(key)) {
                    exports = templateExportsObject.get('#');
                }
                if (_isEmpty(exports)) {
                    exports = templateExportsObject.get('default');
                }
            }
            // --------------
            if (!_isEmpty(exports)) {
                itemEl = exports[0].cloneNode(true);
                var existing = {};
                _arrFrom(el.children).forEach(_el => {
                    existing[_el.getAttribute(itemIndexAttribute)] = _el;
                })
                var following = _following(Object.keys(existing), key + ''/*numeric key needs this*/, true/*length*/)
                    .reduce((closest, _key) => closest || existing[_key], null);
                if (following) {
                    var d = following.before(itemEl);
                } else {
                    var d = el.append(itemEl);
                }
                itemEl.setAttribute(itemIndexAttribute, key);
            }
        }
        if (itemEl) {
            if (!(_isFunction(params.renderCallback) && params.renderCallback('render', itemEl, itemData, key, isUpdate) === false)) {
                if (_isTypeObject(itemData)) {
                    let setState = OOHTML.meta.get('api.setState');
                    itemEl[setState](itemData);
                }
            }
        }
    };
    // -----------------
    const _del = (el, key, oldValue) => {
        var itemEl = childSelector(el, '[' + itemIndexAttribute + '="' + key + '"]');
        if (itemEl) {
            var rspns;
            if (!(_isFunction(params.renderCallback) && params.renderCallback('unrender', itemEl, oldValue, key) === false)) {
                let clearState = OOHTML.meta.get('api.clearState');
                itemEl[clearState]();
            }
            var remove = () => itemEl.remove();
            if (rspns instanceof Promise) {
                rspns.then(remove).catch(remove);
            } else {
                remove();
            }
        }
    };
    const context = this;
    getEls.call(this, els).forEach(el => {
        const previousBindings = _internals(el, 'play-ui').get('boundItems');
        if (previousBindings && previousBindings !== items) {
            childSelectorAll(el, '[' + itemIndexAttribute + ']').forEach(_el => _el.remove());
        }
        let moduleref = el.getAttribute(OOHTML.meta.get('attr.moduleref')),
            itemExportId = params.itemExportId || ((moduleref || '').includes('#') ? moduleref.split('#')[1] : null);
        let templateEl = el[OOHTML.meta.get('api.moduleref')];
        let templateExportsObject = templateEl ? templateEl[OOHTML.meta.get('api.exports')] : null;
        if (!templateEl || !templateExportsObject || !_isTypeObject(items)) {
            return;
        }
        // -----------------
        var isUpdate = childSelector(el, '[' + itemIndexAttribute + ']') ? true : false;
        _each(items, (key, item) => _set(el, templateExportsObject, itemExportId, key, item, isUpdate));
        if (params.live !== false && Observer.observe) {
            if (previousBindings) {
                Observer.unobserve(previousBindings, null, null, {tags: ['#playui-itemize', itemize, this]});
            }
            Observer.observe(items, changes => {
                changes.forEach(entry => {
                    if (_isArray(items) && entry.name === 'length') {
                        return;
                    }
                    if (entry.type === 'del') {
                        _del(el, entry.name, entry.oldValue);
                    } else if (entry.type === 'set' || entry.type === 'def') {
                        _set(el, templateExportsObject, itemExportId, entry.name, entry.value, entry.isUpdate);
                    }
                });
            }, {tags: ['#playui-itemize', itemize, this]});
            _internals(el, 'play-ui').set('boundItems', items);
        }
        // -----------------
        if (params.overflowCallback) {
            var normalizationState, collapsed = new Map();
            var reflow = async (contentRect = null, boundingRect = null, isRerun = false) => {
                // ---------------
                var uncollapsed = Object.values(items).filter(item => !collapsed.has(item));
                if (!isRerun && _isFunction(params.overflowContainerCallback)) {
                    var shouldContinue = await params.overflowContainerCallback(true, el, uncollapsed.length, collapsed.size);
                    if (shouldContinue === false) {
                        return;
                    }
                }
                // ---------------
                if (!contentRect || !boundingRect) {
                    // Block nw ResizeObserver events
                    normalizationState = normalizationState || true;
                    // Read rects performantly
                    await Reflow.onread(resolve => {
                        if (params.parentalOverflowBounds !== false) {
                            boundingRect = boundingRect || el.parentNode.getBoundingClientRect();
                            contentRect = contentRect || el.getBoundingClientRect();
                        } else {
                            boundingRect = boundingRect || el.getBoundingClientRect();
                            contentRect = {width: el.scrollWidth, height: el.scrollHeight};
                            // If there's a chance contentRect is smaller than what scrollWidth and scrollHeight can tell
                            if ((params.orientation === 'vertical' && boundingRect.height === contentRect.height)
                            || (params.orientation !== 'vertical' && boundingRect.width === contentRect.width)) {
                                contentRect = uncollapsed.reduce((rect, item) => {
                                    var itemRect = itemDetails(item).el.getBoundingClientRect();
                                    return {
                                        width: rect.width + itemRect.width,
                                        height: rect.height + itemRect.height,
                                    };
                                }, {width: 0, height: 0});
                            }
                        }
                        resolve();
                    }, true/* withPromise */);
                }
                // ---------------
                // Compare rects
                var currentContainerSize, currentElSize;
                if (params.orientation === 'vertical') {
                    currentContainerSize = boundingRect.height;
                    currentElSize = contentRect.height;
                } else {
                    currentContainerSize = boundingRect.width;
                    currentElSize = contentRect.width;
                }
                // ---------------
                // Reflow...
                if (currentElSize > currentContainerSize) {
                    normalizationState = 'collapsing';
                    var _item = params.collapsionPoint === 'start' ? uncollapsed.shift() 
                        : (params.collapsionPoint === 'center' || params.collapsionPoint === 'center-start' ? _arrMid(uncollapsed) 
                            : (params.collapsionPoint === 'center-end' ? _arrMid(uncollapsed, true).pop() : uncollapsed.pop()));
                    if (_item) {
                        // --------
                        // Save collapsion_size
                        var _itemDetails = itemDetails(_item);
                        await Reflow.onread(resolve => {
                            var itemRect = _itemDetails.el.getBoundingClientRect();
                            collapsed.set(_item, params.orientation === 'vertical' ? itemRect.height : itemRect.width);
                            resolve();
                        }, true/* withPromise */);
                        // --------
                        await params.overflowCallback('collapse', _itemDetails.el, _item, _itemDetails.key, collapsed.size);
                    } else {
                        normalizationState = null;
                    }
                } else if (currentElSize < currentContainerSize) {
                    if (normalizationState === 'collapsing') {
                        normalizationState = null;
                    } else if (collapsed.size) {
                        normalizationState = 'restoring';
                        var _item, _itemDetails, keysIterator = collapsed.keys(), keysIteratorCurrent;
                        while((keysIteratorCurrent = keysIterator.next()) && !keysIteratorCurrent.done) {
                            _item = keysIteratorCurrent.value;
                        }
                        var allowance = currentContainerSize - currentElSize;
                        if (allowance >= collapsed.get(_item)/* collapsion_size */ && (_itemDetails = itemDetails(_item))) {
                            collapsed.delete(_item);
                            await params.overflowCallback('restore', _itemDetails.el, _item, _itemDetails.key, collapsed.size);
                        } else {
                            normalizationState = null;
                        }
                    } else {
                        normalizationState = null;
                    }
                } else {
                    normalizationState = null;
                }
                // ---------------
                // Loop until no more normalizing
                if (normalizationState) {
                    await reflow(null, null, true);
                } else if (_isFunction(params.overflowContainerCallback)) {
                    await params.overflowContainerCallback(false, el, uncollapsed.length, collapsed.size);
                }
            };
            // ---------------
            const itemDetails = item => Object.keys(items).reduce((result, key) => result || (items[key] === item ? {
                el: childSelector(el, '[' + itemIndexAttribute + '="' + key + '"]'),
                key,
            } : null), null);
            // ---------------
            var initialCall = true;
            observeResize(window, params.parentalOverflowBounds !== false ? el.parentNode : el, rect => {
                if (!initialCall && normalizationState) { return; }
                initialCall = false;
                reflow(null, rect);
            });
            setTimeout(() => {
                if (previousBindings && !normalizationState) {
                    reflow();
                }
            }, 0);
        }
    });
    return this;
}

/**
 * Helper
 * 
 * @param Element   el 
 * @param String    selector 
 * 
 * @return object
 */
export const childSelector = (el, selector) => {
    return _arrFrom(el.children).reduce((match, child) => match || (child.matches(selector) ? child : null), null);
}
export const childSelectorAll = (el, selector) => {
    return _arrFrom(el.children).filter(child => child.matches(selector));
}

/**
 * @observeResize
 * 
 * @param Element   el 
 * @param Function  callback 
 * 
 * @return object
 */
var sharedResizeObserver, callbacksList;
function observeResize(window, el, callback) {
    if (!sharedResizeObserver) {
        if (!window.ResizeObserver) {
            return;
        }
        callbacksList = new Map();
        sharedResizeObserver = new window.ResizeObserver(entries => {
            entries.forEach(entry => {
                callbacksList.get(entry.target)(entry.contentRect);
            });
        });
    }
    var existing = callbacksList.get(el);
    callbacksList.set(el, callback);
    if (!existing) {
        sharedResizeObserver.observe(el);
    }
};
