
/**
 * @imports
 */
import _each from '@webqit/util/obj/each.js';
import _isArray from '@webqit/util/js/isArray.js';
import _isNumeric from '@webqit/util/js/isNumeric.js';

/**
 * ------------------------------
 * The little transform utility class
 * and stringifyer classes.
 * ------------------------------
 */
const TransformRule = class {
	
	/**
	 * Creates a new TransformRule instance
	 * and each rule's appropriate class.
	 *
	 * @param object		 transformRules
	 *
	 * @return this
	 */
	constructor(transformRules) {
		_each(transformRules, (rule, value) => {
			if (['rotate', 'scale', 'skew', 'translate'].includes(rule)) {
				this[rule] = _isArray(value)
					? new TransformRule[rule](...value)
					: new TransformRule[rule](value);
			}
		});
	}
	
	/**
	 * Stringifies the transformRules in a CSS-compatible format.
	 *
	 * @return string
	 */
	toString() {
		return ['rotate', 'scale', 'skew', 'translate'].reduce(
			(str, rule) => str + (this[rule] && this[rule].length ? ' ' + this[rule] : ''), ''
		).trim();
	}
	
	/**
	 * Unmatrix: parse the values of the matrix
	 *
	 * Algorithm from:
	 *
	 * https://github.com/matthewmueller/unmatrix/blob/master/index.js
	 * @see http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp
	 *
	 * @param string 	 str
	 *
	 * @return {Object}
	 */
	static parse(CTXT, str) {
		// String to matrix
		var stom = function(transformStr) {
			var m = [];
			if (CTXT.window.WebKitCSSMatrix) {
				m = new CTXT.window.WebKitCSSMatrix(transformStr);
				return [m.a, m.b, m.c, m.d, m.e, m.f];
			}
			var rdigit = /[\d\.\-]+/g;
			var n;
			while(n = rdigit.exec(transformStr)) {
				m.push(+n);
			}
			return m;
		};
		// Round to the nearest hundredth
		var round = function(n) {
			return Math.round(n * 100) / 100;
		};
		// Radians to degrees
		var r2d = function(radians) {
			var deg = radians * 180 / Math.PI;
			return round(deg);
		};
		// ---------------------------------
		var m = stom(str);
		var A = m[0];
		var B = m[1];
		var C = m[2];
		var D = m[3];
		if (A * D == B * C) throw new Error('Dramatic.parseTransform: matrix is singular');
		// step (3)
		var scaleX = Math.sqrt(A * A + B * B);
		A /= scaleX;
		B /= scaleX;
		// step (4)
		var skew = A * C + B * D;
		C -= A * skew;
		D -= B * skew;
		// step (5)
		var scaleY = Math.sqrt(C * C + D * D);
		C /= scaleY;
		D /= scaleY;
		skew /= scaleY;
		// step (6)
		if ( A * D < B * C ) {
			A = -A;
			B = -B;
			skew = -skew;
			scaleX = -scaleX;
		}
		return new TransformRule({
			translate: [/*x*/m[4], /*y*/m[5],],
			scale: [/*x*/round(scaleX), /*y*/round(scaleY),],
			rotate: r2d(Math.atan2(B, A)),
			skew: r2d(Math.atan(skew)),
		});
	};
};

/**
 * -------------
 * The "rotate" value class
 * -------------
 */
TransformRule.rotate = class extends Array {
	
	/**
	 * Returns "rotate" values as a CSS function
	 *
	 * @return string
	 */
	toString() {
		var values = this.map(val => _isNumeric(val) ? val + 'deg' : val);
		return 'rotate(' + values.join(', ') + ')';
	}
};

/**
 * -------------
 * The "scale" array class
 * -------------
 */
TransformRule.scale = class extends Array {
	
	/**
	 * Returns "scale" values as a CSS function
	 *
	 * @return string
	 */
	toString() {
		return 'scale(' + this.join(', ') + ')';
	}
};

/**
 * -------------
 * The "skew" array class
 * -------------
 */
TransformRule.skew = class extends Array {
	
	/**
	 * Returns "skew" values as a CSS function
	 *
	 * @return string
	 */
	toString() {
		var values = this.map(val => _isNumeric(val) ? val + 'deg' : val);
		return 'skew(' + values.join(', ') + ')';
	}
};

/**
 * -------------
 * The "translate" array class
 * -------------
 */
TransformRule.translate = class extends Array {
	
	/**
	 * Returns "translate" values as a CSS function
	 *
	 * @return string
	 */
	toString() {
		var values = this.map(val => _isNumeric(val) ? val + 'px' : val);
		return 'translate(' + values.join(', ') + ')';
	}
};

/**
 * @exports
 */
export default TransformRule;