
/**
 * Parses/decodes transform rule
 *
 * @param string str
 *
 * @return object
 */
export default function(str) {
	var transform = {};
	var regex = /(\w+)\((.+?)\)/g;
	var match = null;
	while(match = regex.exec(str)) {
		transform[match[1]] = (match[2].indexOf(',') > -1 ? match[2].replace(' ', '').split(',') : match[2]);
	}
	return transform;
};
