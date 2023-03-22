
/**
 * @imports
 */
import { PlayElementClassFactory } from './PlayElementClassFactory.js';

/**
 * @PlayElementLite
 */
export default function PlayElement( HTMLElement ) {
    if ( typeof self.webqit !== 'object' ) throw new Error( `No "webqit" object in context.` );
    if ( typeof self.webqit.SubscriptFunction !== 'function' ) throw new Error( `No "webqit.SubscriptFunction" function in context.` );
    if ( typeof self.webqit.Observer !== 'object' ) throw new Error( `No "webqit.Observer" object in context.` );
    return PlayElementClassFactory( HTMLElement, window.webqit.SubscriptFunction, window.webqit.Observer );
}