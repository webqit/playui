/**
 * @imports
 */
import getFirebase from './getFirebase.js';
import Listeners from './Listeners.js';

/**
 * Returns Observers List handle.
 * 
 * @param object    object 
 * @param bool      createIfNotExist 
 * 
 * @returns Observers
 */
export default function(object, createIfNotExist = true) {
    return getFirebase(object, 'listeners', createIfNotExist ? Listeners : null);
};