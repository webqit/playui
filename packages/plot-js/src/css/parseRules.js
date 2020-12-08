
/**
 * Helper method: parses a CSS string into an associative array.
 *
 * @param string	 	css
 *
 * @return object
 */
export default function(css) {
	var _split = {};
	css.split(';').filter(r => r).forEach(rule => {
		rule = rule.split(':');
		_split[rule[0].trim()] = rule[1].trim();
	});
	return _split;
};
