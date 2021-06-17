
/**
 * @imports
 */
import _arrFrom from '@webqit/util/arr/from.js';
import _copy from '@webqit/util/obj/copy.js';
import UIRect from './UIRect.js';

/**
 * -----------
 * The Proximity class
 * -----------
 */
export default class Proximity {

    /**
     * 
     * @param Object props 
     * @param Object params 
     */
    constructor(props, params = {}) {
        Object.keys(props).forEach(key => {
            Object.defineProperty(this, key, {get: () => props[key]});
        });
        this.params = params;
    }

	/**
	 * Computes the percentage proximity between two rects.
	 *
	 * @param object		rect1
	 * @param object		rect2
	 * @param string|array	axis
	 * @param object		previousProximity
     * @param Object                     	params
	 *
	 * @return object
	 */
	static calculate(rect1, rect2, axis, previousProximity, param = {}) {
		var $proximity = {intersection: UIRect.calculate(rect1, param).intersectionWith(rect2)};				
		$proximity.x = $proximity.x || {};
		$proximity.y = $proximity.y || {};
		previousProximity = _copy(previousProximity);
		// X,Y processing...
		(axis ? _arrFrom(axis) : ['x', 'y']).forEach(axis => {
			// In the context of the given axis...
			var distanceBefore = axis === 'x' ? 'left' : 'top';
			var distanceAfter = axis === 'x' ? 'right' : 'bottom';
			var rect1Length = rect1[axis === 'x' ? 'width' : 'height'];
			var rect2Length = rect2[axis === 'x' ? 'width' : 'height'];
			// ----- In which direction are we advancement
			$proximity[axis].advancement = undefined;
			if (previousProximity.intersection) {
				$proximity[axis].advancement = previousProximity.intersection[distanceBefore] > $proximity.intersection[distanceBefore] 
					? 'positive' : (previousProximity.intersection[distanceBefore] < $proximity.intersection[distanceBefore] 
						? 'negative' : previousProximity[axis].advancement);
			}
			// ----- Cross-in percentage
			var percentageIn = 0;
			// Element topline touches or passes Anchor bottom line
			if ($proximity.intersection[distanceBefore] <= rect2Length
			// Element bottom line is yet to touch, or is just touches Anchor bottom line
			&& $proximity.intersection[distanceAfter] <= 0) {
				percentageIn = (rect1Length - Math.abs($proximity.intersection[distanceAfter])) / rect1Length;
			} else if ($proximity.intersection[distanceAfter] > 0) {
				percentageIn = 1;
			}
			// ----- Cross-out percentage
			var percentageOut = 0;
			// Element topline touches or passes Anchor top line
			if ($proximity.intersection[distanceBefore] <= 0
			// Element bottom line is yet to touch, or is just touches Anchor top line
			&& $proximity.intersection[distanceAfter] <= rect2Length) {
				percentageOut = Math.abs($proximity.intersection[distanceBefore]) / rect1Length;
			} else if ($proximity.intersection[distanceAfter] > rect2Length) {
				percentageOut = 1;
			}
			// ----- Cross-pass percentage
			var percentagePass = 0;
			// Element topline touches or passes Anchor bottom line
			if ($proximity.intersection[distanceBefore] <= rect2Length
			// Element bottom line is yet to touch, or is just touches Anchor top line
			&& $proximity.intersection[distanceAfter] <= rect2Length) {
				var totalDistance = rect2Length + rect1Length;
				var currentPass = $proximity.intersection[distanceBefore] + rect1Length;
				percentagePass = (totalDistance - currentPass) / totalDistance;
			} else if ($proximity.intersection[distanceAfter] > rect2Length) {
				percentagePass = 1;
			}
			// ----- Cross-overflow percentage
			var percentageContained = 0;
			if (rect1Length > rect2Length) {
				// Element is larger than, and covering Anchor top/bottom lines
				if ($proximity.intersection[distanceBefore] <= 0
				&& $proximity.intersection[distanceAfter] <= 0) {
					var lengthDifference = rect1Length - rect2Length;
					percentageContained = Math.abs($proximity.intersection[distanceBefore]) / lengthDifference;
				} else if ($proximity.intersection[distanceAfter] > 0) {
					percentageContained = 1;
				}
			} else {
				// Element is smaller than, and within Anchor top/bottom lines
				if ($proximity.intersection[distanceBefore] >= 0
				&& $proximity.intersection[distanceAfter] >= 0) {
					var lengthDifference = rect2Length - rect1Length;
					percentageContained = $proximity.intersection[distanceAfter] / lengthDifference;
				} else if ($proximity.intersection[distanceBefore] < 0) {
					percentageContained = 1;
				}
			}
			// ------ Bind the values to the instance object
			if ($proximity[axis].advancement === 'positive') {
				$proximity[axis].percentageIn = percentageIn;
				$proximity[axis].percentageOut = percentageOut;
				$proximity[axis].percentagePass = percentagePass;
				$proximity[axis].percentageContained = percentageContained;
			} else {
				$proximity[axis].percentageIn = 1 - percentageOut;
				$proximity[axis].percentageOut = 1 - percentageIn;
				$proximity[axis].percentagePass = 1 - percentagePass;
				$proximity[axis].percentageContained = 1 - percentageContained;
			}
			if (rect1Length > rect2Length) {
				$proximity[axis].percentageContained *= -1;
			}
		});
		return new this($proximity, params);
	}
}
