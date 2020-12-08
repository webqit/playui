
/**
 * Loops thru all rules in all stylesheets (in reverse order possible).
 *
 * @param function			callback
 * @param bool				reversed
 *
 * @return NULL|bool
 */
export default function(callback, reversed = false) {
	var stylesheets = document.styleSheets;
	var stylesheetCallback = function(stylesheet) {
		try {
			for (var k = 0; k < stylesheet.cssRules.length; k ++) {
				var ruleDefinition = stylesheet.cssRules[k];
				if (callback(ruleDefinition) === true) {
					return true;
				}
			}
		} catch (e) {}
	}
	if (reversed) {
		for (var i = stylesheets.length - 1; i >= 0; i --) {
			if (stylesheetCallback(stylesheets[i]) === true) {
				return true;
			}
		}
	} else {
		for (var i = 0; i < stylesheets.length; i ++) {
			if (stylesheetCallback(stylesheets[i]) === true) {
				return true;
			}
		}
	}
};
