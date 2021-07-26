
/**
 * @imports
 */
import { _isTypeObject, _isFunction, _getType, _internals } from '@webqit/util/js/index.js';

/**
 * Returns an subject's firebase.
 *
 * @param array|object	subject
 * @param string      	firebaseKey
 * @param object      	Base
 *
 * @return Firebase
 */
export default function(subject, firebaseKey, Base = null) {
    if (!_isTypeObject(subject)) {
        throw new Error('Subject must be of type object; "' + _getType(subject) + '" given!');
    }
    var firebase, playUiStub = _internals(subject, 'play-ui');
    if (!(firebase = playUiStub.get(firebaseKey)) && Base) {
        firebase = new Base(subject);
        playUiStub.set(firebaseKey, firebase);
    }
    return firebase;
};