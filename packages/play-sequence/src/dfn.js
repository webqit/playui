
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
                duration: 200,
                classIn: '',
                classInAlt: '',
                classOut: '',
                oneoff: false,
            });
            var classIn = params.classIn ? params.classIn.split(' ').map(c => c.trim()) : null;
            var classInAlt = params.classInAlt ? params.classInAlt.split(' ').map(c => c.trim()) : null;
            var classOut = params.classOut ? params.classOut.split(' ').map(c => c.trim()) : null;
            // ----------------
            if (classIn) {
                var sequenceA = new Sequence;
                sequenceA.play((el, state, reversed, currentTime) => {
                    if (state === 'pause') {
                        return false;
                    }
                    if (state === 'begin') {
                        if (!params.duration && classInAlt) {
                            el.classList.remove(...classInAlt);
                        }
                        el.classList.add(...classIn);
                        if (classOut) {
                            el.classList.remove(...classOut);
                        }
                    } else if (state === 'end') {
                        if (params.duration) {
                            el.classList.remove(...classIn);
                        }
                    }
                }, params);
            }
            // -----------------
            if (classInAlt) {
                var sequenceB = new Sequence;
                sequenceB.play((el, state, reversed, currentTime) => {
                    if (state === 'pause') {
                        return false;
                    }
                    if (state === 'begin') {
                        if (!params.duration && classIn) {
                            el.classList.remove(...classIn);
                        }
                        el.classList.add(...classInAlt);
                        if (classOut) {
                            el.classList.remove(...classOut);
                        }
                    } else if (state === 'end') {
                        if (params.duration) {
                            el.classList.remove(...classInAlt);
                        }
                    }
                }, params);
            }
            // --------------
            this.intersectionObserver = new window.IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (entry.boundingClientRect.top < 0) {
                            if (classInAlt) {
                                // Top-to-bottom motion
                                sequenceB.add(entry.target);
                            }
                        } else if (classIn) {
                            // Bottom-to-top motion
                            sequenceA.add(entry.target);
                        }
                    } else {
                        if (classOut && !(classIn || []).concat(classInAlt || []).filter(c => entry.target.classList.contains(c)).length) {
                            // Off viewport
                            entry.target.classList.add(...classOut);
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

    /**
     * @list-item
    */
   const div = class extends window.HTMLDivElement {
        
        /**
         * Establish a common Timeline.
         *
         * @return void
         */
        connectedCallback() {
            var params = (this.getAttribute('play-seq') || '').split(';').reduce((p, prop) => {
                var [ name, value ] = prop.split(':').map(s => s.trim());
                p[name] = value;
                return p;
            }, {
                rootMargin: '50px',
                classIn: '',
                classInAlt: '',
                classOut: '',
            });
            var classIn = params.classIn ? params.classIn.split(' ').map(c => c.trim()) : null;
            var classInAlt = params.classInAlt ? params.classInAlt.split(' ').map(c => c.trim()) : null;
            var classOut = params.classOut ? params.classOut.split(' ').map(c => c.trim()) : null;
            // --------------
            Observe(this, params.rootMargin, entry => {
                if (entry.isIntersecting) {
                    if (entry.boundingClientRect.top < 0) {
                        if (classInAlt) {
                            // Top-to-bottom motion
                            entry.target.classList.remove(...classIn);
                            entry.target.classList.add(...classInAlt);
                            entry.target.classList.remove(...classOut);
                        }
                    } else if (classIn) {
                        // Bottom-to-top motion
                        entry.target.classList.remove(...classInAlt);
                        entry.target.classList.add(...classIn);
                        entry.target.classList.remove(...classOut);
                    }
                } else {
                    if (classOut && !(classIn || []).concat(classInAlt || []).filter(c => entry.target.classList.contains(c)).length) {
                        // Off viewport
                        entry.target.classList.add(...classOut);
                    }
                }
            });
        }
        
    };

    return {
        ul,
        li,
        div,
    }
};

const Observers = new Map();
const Observe = (el, rootMargin, callback) => {
    if (!Observers.has(rootMargin)) {
        const callbacks = new Map();
        Observers.set(rootMargin, {
            o: new window.IntersectionObserver(entries => {
                entries.forEach(entry => {
                    callbacks.get(entry.target)(entry);
                });
            }, {rootMargin}), 
            c: callbacks,
        });
    }
    var obs = Observers.get(rootMargin);
    obs.c.set(el, callback);
    obs.o.observe(el);
};
