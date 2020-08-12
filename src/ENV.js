
/**
 * Environmental
 * variables
 */
const ENV = {
	params: {},
};
(function(Window) {
	ENV.detect = function() {
		if (!Window) {
			return '';
		}
		// Firefox 1.0+
		var isFirefox = typeof Window.InstallTrigger !== 'undefined';
		if (isFirefox) {
			return 'firefox';
		}
		// Safari 3.0+ "[object HTMLElementConstructor]" 
		var isSafari = /constructor/i.test(Window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!Window['safari'] || (typeof Window.safari !== 'undefined' && Window.safari.pushNotification));
		if (isSafari) {
			return 'safari';
		}
		// Chrome 1 - 79
		var isChrome = !!Window.chrome && (!!Window.chrome.webstore || !!Window.chrome.runtime);
		// Edge (based on chromium) detection
		var isEdgeChromium = isChrome && (Window.navigator.userAgent.indexOf("Edg") != -1);
		// Opera 8.0+
		var isOpera = (!!Window.opr && !!Window.opr.addons) || !!Window.opera || Window.navigator.userAgent.indexOf(' OPR/') >= 0;
	
		// Internet Explorer 6-11
		var isIE = /*@cc_on!@*/false || !!Window.document.documentMode;
		// Edge 20+
		var isEdge = !isIE && !!Window.StyleMedia;
		// Blink engine detection
		var isBlink = (isChrome || isOpera) && !!Window.CSS;
		return isEdge ? 'edge' : (
			isIE ? 'ie' : (
				isOpera ? 'opera' : (
					isEdgeChromium ? 'ie-chromium' : (
						isChrome ? 'chrome' : 'unknown'
					)
				)
			)
		);
	};
})(window);

/**
 * @exports
 */
export default ENV;