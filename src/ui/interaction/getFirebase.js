
/**
 * @imports
 */
import _isTypeObject from '@webqit/util/js/isTypeObject.js';
import _isFunction from '@webqit/util/js/isFunction.js';
import _getType from '@webqit/util/js/getType.js';
import { getPlayUIStub } from '../../util.js';

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
    var firebase, playUiStub = getPlayUIStub(subject);
    if (!(firebase = playUiStub[firebaseKey]) && Base) {
        firebase = new Base(subject);
        playUiStub[firebaseKey] = firebase;
    }
    return firebase;
};