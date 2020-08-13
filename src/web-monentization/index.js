
/**
 * @imports
 */
import Observer from '@web-native-js/observer';
import ENV from '../ENV.js';

/**
 * ---------------------------
 * The WebMonetization class
 * ---------------------------
 *
 * This class provisions the Web Monetization API as a Observerive object
 * and adds additional functionality.
 */
			
export default class WebMonetization {

	/**
	 * Constructs a new WebMonetization instance. Typically,
	 * only one instance would be needed app-wide. So this should
	 * be used as a singleton.
	 *
	 * @param string    paymentPointer
	 * @param object    params
	 *
	 * @return void
	 */
	constructor(paymentPointer, params = {}) {
        this.paymentPointer = paymentPointer;
        this.params = params;
        if (!this.assertSupport(this.getTag() && this.params.prompt)) {
            return;
        }
        var monetization = window.document.monetization;
		// -----------------------
		// Startup route
        Observer.set(this, 'state', monetization.state);
        // Observers
        monetization.addEventListener('monetizationpending', e => {
            Observer.set(this, {
                state: 'pending',
            }, e.detail);
        });
        monetization.addEventListener('monetizationstart', e => {
            currentTotal = 0;
            Observer.set(this, {
                state: 'started',
            }, e.detail);
        });
        monetization.addEventListener('monetizationstop', e => {
            Observer.set(this, {
                state: 'stopped',
            }, e.detail);
        });
        var scale, currentTotal = 0, sessionTotal = 0;
        monetization.addEventListener('monetizationprogress', e => {
            if (sessionTotal === 0) {
                scale = e.detail.assetScale;
            }
            var progressAmount = Number(e.detail.amount);
            currentTotal += progressAmount;
            sessionTotal += progressAmount;
            Observer.set(this, {
                progress: {
                    currentTotal: {
                        amount: currentTotal,
                        value: (currentTotal * Math.pow(10, - scale)).toFixed(scale),
                    },
                    sessionTotal: {
                        amount: sessionTotal,
                        value: (sessionTotal * Math.pow(10, - scale)).toFixed(scale),
                    },
                },
                currency: scale,
           }, e.detail);
        });
	}

	/**
	 * Starts a new monetization stream by adding a meta tag
     * to the document.
	 *
	 * @return this
	 */
	start() {
		if (!this.getTag(this.paymentPointer)) {
            var monetizationMeta;
            // Remove any other instance
            if (monetizationMeta = this.getTag()) {
                monetizationMeta.remove();
            }
            monetizationMeta = window.document.createElement('meta');
            monetizationMeta.setAttribute('name', 'monetization');
            monetizationMeta.setAttribute('content', this.paymentPointer);
			window.document.querySelector('head').appendChild(monetizationMeta);
        }
        this.assertSupport(this.params.prompt);
        return this;
    }
    
	/**
	 * Stops an ongoing monetization stream by removing a meta tag
     * from the document.
	 *
	 * @return this
	 */
	stop() {
		if (monetizationMeta = this.getTag()) {
            monetizationMeta.remove();
        }
        return this;
    }
    
	/**
	 * Returns the document's Web WebMonetization meta tag if exists.
	 *
	 * @param string    withPaymentPointer
	 *
	 * @return HTMLElement|null
	 */
	getTag(withPaymentPointer = null) {
        return window.document.querySelector('meta[name="monetization"]' + (withPaymentPointer ? '[content="' + withPaymentPointer + '"]' : ''));
    }

	/**
	 * Asserts that the browser supports Web WebMonetization.
	 *
     * @param bool      prompt
     * 
	 * @return bool
	 */
	assertSupport(prompt) {
        var head = window.document.querySelector('head');
		if (!window.document.monetization) {
            if (prompt) {
                var extensionUrl, browserType = ENV.detect();
                if (browserType.startsWith('ie')) {
                    // Desktop extension
                    extensionUrl = 'https://microsoftedge.microsoft.com/addons/detail/ljionajlbinlfkdnpkloejeoogfgkojm';
                } else if (browserType === 'firefox') {
                    // Desktop and android extension
                    extensionUrl = 'https://addons.mozilla.org/en-US/firefox/addon/coil/';
                } else if (browserType === 'chrome' || browserType === 'brave') {
                    // Desktop extension
                    extensionUrl = 'https://chrome.google.com/webstore/detail/coil/locbifcbeldmnphbgkdigjmkbfkhbnca';
                }
                if (extensionUrl) {
                    if (window.confirm("This version of " + browserType + " does not support the Web WebMonetization API! \r\nWould you like to add the Web WebMonetization extension?")) {
                        window.open(extensionUrl, '_blank');
                    };
                } else {
                    window.alert('Your browser does not support the Web WebMonetization API.');
                }
            }
            return false;
        }
        return true;
    }
            
	/**
	 * Static instantiator;
     * returns singleton instances per paymentPointer.
	 *
	 * @param string        paymentPointer
	 * @param object        params
	 *
	 * @return WebMonetization
	 */
	static init(paymentPointer, params = {}) {
        if (!WebMonetization.instances[paymentPointer]) {
            WebMonetization.instances[paymentPointer] = new WebMonetization(paymentPointer, params);
        }
        return WebMonetization.instances[paymentPointer];
    }
};

/**
 * @var object
 */
WebMonetization.instances = {};