
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

/**
 * Binds a (reactive) list context to the instance.
 * Childnodes will be automatically created/removed per key.
 *
 * @param Element 		el
 * @param array 		items
 * @param function 		renderCallback
 * @param function 		overflowCallback
 * @param Object 		params
 *
 * @return Promise
 */
export default function itemize(el, items, renderCallback = null, overflowCallback = null, params = {}) {
    if (!el.template || !el.template.exports || !_isTypeObject(items)) {
        return;
    }
    // -----------------
    const itemIndexAttribute = params.itemIndexAttribute || 'data-index';
    const _set = (key, itemData, isUpdate) => {
        var itemEl;
        if (isUpdate && el.children.length) {
            itemEl = childSelector(el, '[' + itemIndexAttribute + '="' + key + '"]');
        } else {
            // --------------
            var exports;
            if (params.itemExportId) {
                exports = el.template.exports[params.itemExportId];
            } else {
                exports = el.template.exports[key];
                if (_isEmpty(exports) && _isNumeric(key)) {
                    exports = el.template.exports['#'];
                }
                if (_isEmpty(exports)) {
                    exports = el.template.exports['default'];
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
            if (_isFunction(renderCallback)) {
                renderCallback(itemEl, 'bind', itemData, key, isUpdate);
            }
        }
    };
    // -----------------
    const _del = (key, oldValue) => {
        var itemEl = childSelector(el, '[' + itemIndexAttribute + '="' + key + '"]');
        if (itemEl) {
            var rspns;
            if (_isFunction(renderCallback)) {
                rspns = renderCallback(itemEl, 'unbind', oldValue, key);
            }
            var remove = () => itemEl.remove();
            if (rspns instanceof Promise) {
                rspns.then(remove).catch(remove);
            } else {
                remove();
            }
        }
    };
    // -----------------
    var isUpdate = childSelector(el, '[' + itemIndexAttribute + ']') ? true : false;
    _each(items, (item, key) => _set(item, key, isUpdate));
    if (params.bind !== false && this.Observer.observe) {
        if (stub(el).previousBindings) {
            this.Observer.unobserve(stub(el).previousBindings, null, null, {tags: ['#playui-itemize', itemize, this]});
        }
        this.Observer.observe(items, changes => {
            changes.forEach(entry => {
                if (_isArray(items) && entry.name === 'length') {
                    return;
                }
                if (entry.type === 'del') {
                    _del(entry.name, entry.oldValue);
                } else if (entry.type === 'set' || entry.type === 'def') {
                    _set(entry.name, entry.value, entry.isUpdate);
                }
            });
        }, {tags: ['#playui-itemize', itemize, this]});
        stub(el).previousBindings = items;
    }
    // -----------------
    if (overflowCallback) {
        var normalizationState, collapsed = new Map(), reflow = async (contentRect = null, boundingRect = null) => {
            var uncollapsed = Object.values(items).filter(item => !collapsed.has(item));
            // ---------------
            if (!contentRect || !boundingRect) {
                // Block nw ResizeObserver events
                normalizationState = normalizationState || true;
                // Read rects performantly
                await this.Reflow.onread(resolve => {
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
                    await this.Reflow.onread(resolve => {
                        var itemRect = _itemDetails.el.getBoundingClientRect();
                        collapsed.set(_item, params.orientation === 'vertical' ? itemRect.height : itemRect.width);
                        resolve();
                    }, true/* withPromise */);
                    // --------
                    await overflowCallback(_itemDetails.el, 'collapse', _item, _itemDetails.key, collapsed.size);
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
                        await overflowCallback(_itemDetails.el, 'restore', _item, _itemDetails.key, collapsed.size);
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
            // Loop until normalized
            if (normalizationState) {
                await reflow();
            }
        };
        // ---------------
        const itemDetails = item => Object.keys(items).reduce((result, key) => result || (items[key] === item ? {
            el: childSelector(el, '[' + itemIndexAttribute + '="' + key + '"]'),
            key,
        } : null), null);
        // ---------------
        observeResize.call(this, params.parentalOverflowBounds !== false ? el.parentNode : el, rect => {
            if (normalizationState) { return; }
            reflow(null, rect);
        });
    }
};

/**
 * Helper
 * 
 * @param Element   el 
 * 
 * @return object
 */
export const stub = el => {
    if (!el['.stub']) {
        el['.stub'] = {};
    }
    return el['.stub'];
};

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
};

/**
 * @observeResize
 * 
 * @param Element   el 
 * @param Function  callback 
 * 
 * @return object
 */
var sharedResizeObserver, callbacksList;
function observeResize(el, callback) {
    if (!sharedResizeObserver) {
        if (!this.window.ResizeObserver) {
            return;
        }
        callbacksList = new Map();
        sharedResizeObserver = new this.window.ResizeObserver(entries => {
            entries.forEach(entry => {
                callbacksList.get(entry.target)(entry.contentRect);
            });
        });
    }
    callbacksList.set(el, callback);
    sharedResizeObserver.observe(el);
};
