
/**
 * @imports
 */
import play from '@webqit/play-js/src/animation/play.js';

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
        		
		// Expand
		async expand() {
            this.bindings.state = 'expanding';
            var orientation = this.bindings.orientation;
            if (orientation === 'horizontal') {
                await play(this, {width: '100%', opacity: 1}, this.bindings.timing || {});
            } else /*if (orientation === 'vertical')*/ {
                await play(this, {height: 'auto', opacity: 1}, this.bindings.timing || {duration:400});
            }
            this.bindings.state = 'expanded';
        }
		
		// Collapse
		async collapse() {
            this.bindings.state = 'collapsing';
            var orientation = this.bindings.orientation;
            if (orientation === 'horizontal') {
                await play(this, {width: 0, opacity: 0}, this.bindings.timing || {});
            } else /*if (orientation === 'vertical')*/ {
                await play(this, {height: 0, opacity: 0}, this.bindings.timing || {duration:400});
            }
            this.bindings.state = 'collapsed';
        }
		
		// Toggle
		toggle() {
            if (this.bindings.state !== 'expanded') {
				return this.expand();
            }
            if (this.bindings.state !== 'collapsed') {
				return this.collapse();
            }
		}

    };

    /**
     * @list-item
    */
    const li = class extends window.HTMLLIElement {
		
		/**
		 * This triggers self-inclusion
		 *
		 * @return void
		 */
		connectedCallback() {
			if (this.parentNode.collapsibleAdd) {
				this.parentNode.collapsibleAdd(this);
            }
		}

    };
    
    return {
        ul,
        li,
    }
};
