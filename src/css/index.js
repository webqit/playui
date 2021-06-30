/**
 * @imports
 */
import cssAsync from './cssAsync.js';
import cssSync from './cssSync.js';
import cssTransaction from './cssTransaction.js';
import * as classes from './classes/index.js';
import { readKeyframes, readVar, vendorize } from './global-css.js';

/**
 * @utils
 */
const utils = {
    readKeyframes,
    readVar,
    vendorize,
};

/**
 * @exports
 */
export {
    cssAsync,
    cssSync,
    cssTransaction,
    classes,
    utils,
}