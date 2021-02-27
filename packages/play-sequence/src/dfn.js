
/**
 * @imports
 */
import Sequence from '@webqit/play-js/src/animation/Sequence.js';


/**
 * ---------------------------
 * Class definitions
 * ---------------------------
 */
export default function(window) {

    /**
     * @list
    */
    const ul = class extends window.HTMLUListElement {
        
        /**
         * Establish a common Timeline.
         *
         * @return void
         */
        connectedCallback() {
            var params = (this.getAttribute('play-seq') || '').split(';').reduce((p, prop) => {
                var [ name, value ] = prop.split(':').map(s => s.trim());
                p[name] = ['duration', 'lag', 'oneoff'].includes(name) ? parseInt(value) : value;
                return p;
            }, {
                lag: 100,
                rootMargin: '50px',
                orientation: 'v',
                duration: 200,
                class: '',
                classAlt: '',
                oneoff: true,
            });
            // ----------------
            if (params.class) {
                var sequenceA = new Sequence;
                sequenceA.play((el, state, reversed, currentTime) => {
                    if (state === 'pause') {
                        return false;
                    }
                    var className = (params.class + (reversed ? ' animation-reversed' : '')).split(' ').map(c => c.trim());
                    if (state === 'begin') {
                        el.classList.add(...className);
                    } else if (state === 'end') {
                        el.classList.remove(...className);
                    }
                }, params);
            }
            // -----------------
            if (params.classAlt) {
                var sequenceB = new Sequence;
                sequenceB.play((el, state, reversed, currentTime) => {
                    if (state === 'pause') {
                        return false;
                    }
                    var className = (params.classAlt + (reversed ? ' animation-reversed' : '')).split(' ').map(c => c.trim());
                    if (state === 'begin') {
                        el.classList.add(...className);
                    } else if (state === 'end') {
                        el.classList.remove(...className);
                    }
                }, params);
            }
            // --------------
            this.intersectionObserver = new window.IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (params.classAlt && entry.boundingClientRect.top < 0) {
                            // Top-to-bottom motion
                            sequenceB.add(entry.target);
                        } else if (params.class) {
                            // Bottom-to-top motion
                            sequenceA.add(entry.target);
                        }
                    }
                });
            }, {rootMargin: params.rootMargin});
        }

        /**
         * Adds an element to the sequence.
         *
         * @param HTMLElement el
         *
         * @return void
         */
        sequenceAdd(el) {
            this.intersectionObserver.observe(el);
        }

    };

    /**
     * @list-item
    */
    const li = class extends window.HTMLLIElement {
		
		/**
		 * This triggers self-replacement
		 * when so defined.
		 *
		 * @return void
		 */
		connectedCallback() {
			if (this.parentNode.sequenceAdd) {
				this.parentNode.sequenceAdd(this);
            }
		}

    };
    
    return {
        ul,
        li,
    }
};
