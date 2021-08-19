
/**
 * @_import
 */
import { _isFunction } from '@webqit/util/js/index.js';
import list from './list.js';

/**
 * Binds a (reactive) form context to the instance.
 * Childnodes will be automatically created/removed per key.
 *
 * @param Array|Element 		els
 * @param Object|Array 		    entries
 * @param Object 		        params
 *
 * @return this
 */
export default function form(els, entries, params = {}) {
    const _params = { ...params };
    _params.itemExportId = (entry, templateExportsObject) => {
        if (_isFunction(params.itemExportId)) {
            return params.itemExportId(entry, templateExportsObject);
        }
        return templateExportsObject[entry.display.type];
    };
    return list(els, entries, _params);
}