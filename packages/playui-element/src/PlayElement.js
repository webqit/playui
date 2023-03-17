
/**
 * @imports
 */
import { PlayElementClassFactory } from './PlayElementClassFactory.js';

/**
 * @PlayElementLite
 */
export default function PlayElement( HTMLElement ) {
    if ( typeof self.wq !== 'object' ) throw new Error( `No "wq" object in context.` );
    if ( typeof self.wq.SubscriptFunction !== 'function' ) throw new Error( `No "wq.SubscriptFunction" function in context.` );
    if ( typeof self.wq.Observer !== 'object' ) throw new Error( `No "wq.Observer" object in context.` );
    return PlayElementClassFactory( HTMLElement, window.wq.SubscriptFunction, window.wq.Observer );
}