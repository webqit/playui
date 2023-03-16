
/**
 * @imports
 */
import Observer from '@webqit/observer';
import SubscriptFunction from '@webqit/subscript/src/SubscriptFunction.js';
import { PlayElementClassFactory } from './PlayElementClassFactory.js';

/**
 * @PlayElement
 */
export default function PlayElement( HTMLElement ) {
    return PlayElementClassFactory( HTMLElement, SubscriptFunction, Observer );
}

export {
    SubscriptFunction,
    Observer,
}