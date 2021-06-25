
/**
 * @imports
 */
import Transaction from './classes/Transaction.js';

/**
 * Creates and returns an instance of Transaction for the first element in the set.
 *
 * @param Array|Element			els
 * @param String|Array          props
 * @param Function			    readCallback
 * @param Function			    writeCallback
 *
 * @return Transaction
 */
export default function(els, props, readCallback, writeCallback) {
    const _el = getEls.call(this, els)[0];
    return new Transaction(_el, props, readCallback, writeCallback);
}