
/**
 * @imports
 */
import _toTitle from '@webqit/util/str/toTitle.js';
import _arrFrom from '@webqit/util/arr/from.js';
import _find from '@webqit/util/obj/find.js';
import _isString from '@webqit/util/js/isString.js';
import _isFunction from '@webqit/util/js/isFunction.js';
import _isClass from '@webqit/util/js/isClass.js';
import CustomEvents from './CustomEvents.js';
import Firebase from './base/Firebase.js';
import Listener from './Listener.js';
import Event from './Event.js';

/**
 * ---------------------------
 * The Listeners class
 * ---------------------------
 */				
export default class Listeners extends Firebase {

	/**
	 * Constructs a new observable and returns a proxy wrapper.
	 *
	 * @param HTMLElement			subject
	 *
	 * @return this
	 */
	constructor(subject) {
		super(subject);
		this.handlersList = {};
		this.hammertime = () => {
			if (!this.hmm) {
				if (!WQ.DOM.window.Hammer) {
					throw new Error('The Hammerjs library is needed to use gestures.');
				}
				this.hmm == new WQ.DOM.window.Hammer.Manager(this.subject);
			}
			return this.hmm;
		};
	}

	/**
	 * Sets up an event type when its first listener is added.
	 *
	 * @param string TYPE 
	 * @param object params 
	 *
	 * @return void
	 */
	_setup(TYPE, params) {
		// We register an event only once.
		if (this.handlersList[TYPE]) {
			return;
		}
		if (CustomEvents[TYPE]) {
			if (_isString(CustomEvents[TYPE])) {
				// >> LINK THE ALIAS EVENT TO THIS FIREBASE
				this.handlersList[TYPE] = e => this.fire({type:TYPE, e});
				this.addFireable(new Listener(this.handlersList[TYPE], CustomEvents[TYPE]));
			} else if (_isClass(CustomEvents[TYPE])) {
				// >> LINK THE CUSTOM EVENT TO THIS FIREBASE
				this.handlersList[TYPE] = new CustomEvents[TYPE];
				if (!_isFunction(this.handlersList[TYPE].setup)) {
					throw new Error('The "' + TYPE + '" event hook must implement a "setup" method!');
				}
				this.handlersList[TYPE].setup(this.subject, TYPE, e => {
					this.fire({type:TYPE, e});
				}, this.hammertime());
			} else {
				throw new Error('The "' + TYPE + '" event hook must be either a string (alias) or a class!');
			}
		} else if (recognizeGesture(TYPE.split('+')[0])) {
			// Lets work as if if always a list
			var recognizers = TYPE.split('+').map(gestureName => {
				var mainGestureName = recognizeGesture(gestureName);
				var recognizer = this.hammertime().get(mainGestureName);
				if (!recognizer) {
					recognizer = new Hammer[_toTitle(mainGestureName)];
					this.hammertime().add(recognizer);
				}
				return recognizer;
			});
			// From right to left, recognizeWith all others ahead
			recognizers.forEach((recognizer, i) => {
				recognizer.recognizeWith(recognizers.slice(i + 1));
			});
			// >> LINK THE HAMMER EVENT TO THIS FIREBASE
			this.handlersList[TYPE] = e => this.fire({type:TYPE, e});
			this.hammertime().on(TYPE.split('+').join(' '), this.handlersList[TYPE]);
		} else {
			// >> LINK THE DOM EVENT TO THIS FIREBASE
			this.handlersList[TYPE] = e => this.fire(e);
			this.subject.addEventListener(TYPE, this.handlersList[TYPE]);
		}
	}

	/**
	 * Tears down an event type when its last listener is removed.
	 *
	 * @param string TYPE 
	 *
	 * @return void
	 */
	_teardown(TYPE) {
		// We register an event only once.
		if (!this.handlersList[TYPE]) {
			return;
		}
		if (CustomEvents[TYPE]) {
			if (_isString(CustomEvents[TYPE])) {
				// Level1 custom event
				removeListener(this.subject, CustomEvents[TYPE], this.handlersList[TYPE]);
			} else if (this.handlersList[TYPE]) {
				if (_isFunction(this.handlersList[TYPE].teardown)) {
					// Level2 custom event. We supply the this.unobserve method incase it'll be needed.
					this.handlersList[TYPE].teardown();
				} else {
					throw new Error('The "' + TYPE + '" event hook must implement a "teardown" function!');
				}
			}
		} else if (recognizeGesture(TYPE.split('+')[0])) {
			this.hammertime().off(TYPE.split('+').join(' '), this.handlersList[TYPE]);
		} else {
			// Native event
			this.subject.removeEventListener(TYPE, this.handlersList[TYPE]);
		}
		delete this.handlersList[TYPE];
	}
	
	/**
	 * @inheritdoc
	 */
	add(dfn) {
		this._setup(dfn.filter, dfn.params);
		return super.add(new Listener(this.subject, dfn));
	}

	/**
	 * Fires all observers with the given evt (change).
	 *
	 * @param Event				evt
	 *
	 * @return Event
	 */
	fire(evt) {
		if (!(evt instanceof Event)) {
			evt = new Event(this.subject, evt);
		}
		this.fireables.forEach(listener => {
			if (evt.propagationStopped) {
				return;
			}
			listener.fire(evt);
		});
		return evt;
	}
};

/**
 * Finds the recognizer for a gestureName.
 *
 * @param string	gestureName
 *
 * @return string
 */
const recognizeGesture = function(gestureName) {
	return _find(gestureIndex, list => list.includes(gestureName), false/*deep*/);
};

/**
 * Gesture reference.
 */
const gestureIndex = {
	press: 	['press', 'pressup',], 
	rotate:	['rotate', 'rotatestart', 'rotatemove', 'rotateend', 'rotatecancel',],
	pinch: 	['pinch', 'pinchstart', 'pinchmove', 'pinchend', 'pinchcancel', 'pinchin', 'pinchout',], 
	pan: 	['pan', 'panstart', 'panmove', 'panend', 'pancancel', 'panleft', 'panright', 'panup', 'pandown',],
	swipe: 	['swipe', 'swipeleft', 'swiperight', 'swipeup', 'swipedown',],
	tap: 	['tap',],
};
