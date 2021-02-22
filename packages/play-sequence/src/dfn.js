
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
            var scale = parseInt(this.getAttribute('play-seq-scale') || '1');
            var scale2 = 1 + (1 - scale);
            var cancelForCss = this.hasAttribute('play-seq-cancelforcss');
            var displacement = this.getAttribute('play-seq-displacement') || '0';
            var orientation = this.getAttribute('play-seq-orientation') || 'v';
            var duration = this.getAttribute('play-seq-duration') || 200;
            var lag = this.getAttribute('play-seq-lag') || 100;
            var alpha = this.getAttribute('play-seq-alpha') || 0;
            var orientationStartsA = {
                v: ['0', displacement],
                h: ['-' + displacement, '0'],
            };
            var orientationStartsB = {
                v: ['0', '-' + displacement],
                h: [displacement, '0'],
            };
            var sequenceA = new Sequence;
            var sequenceB = new Sequence;
            var params = {lag, oneoff: true, duration, cancelForCss};
            // ----------------
            sequenceA.play([{
                opacity: alpha,
                transform: {
                    scale: scale + '',
                    translate: orientationStartsA[orientation],
                }
            }, {
                opacity: 1,
                transform: {
                    scale: '1',
                    translate: ['0', '0'],
                }
            }], params);
            // -----------------
            sequenceB.play([{
                opacity: alpha,
                transform: {
                    scale: scale2 + '',
                    translate: orientationStartsB[orientation],
                }
            }, {
                opacity: 1,
                transform: {
                    scale: '1',
                    translate: ['0', '0'],
                }
            }], params);
            // --------------
            this.intersectionObserver = new window.IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (entry.boundingClientRect.top < 0) {
                            // Top-to-bottom motion
                            sequenceB.add(entry.target);
                        } else {
                            // Bottom-to-top motion
                            sequenceA.add(entry.target);
                        }
                    }
                });
            }, {rootMargin: '50px'});
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
