
/**
 * @imports
 */


/**
 * ---------------------------
 * Class definitions
 * ---------------------------
 */
export default function(window) {

    /**
     * @list
    */
    const icon = class extends window.HTMLElement {
        
        /**
         * Establish a common Timeline.
         *
         * @return void
         */
        constructor() {
            super();
            this.params = {};
            this.sizes = {xs: '1', sm: '1.5', md: '2', lg: '3', xl: '3.5', xxl: '4'};
        }

        /**
         * The attributes we want to observe.
         *
         * @return array
         */
        static get observedAttributes() {
            return ['name', 'size'];
        }
                
        /**
         * Handle attribute-change.
         *
         * @param String name
         * @param String oldValue
         * @param String newValue
         *
         * @return void
         */
        attributeChangedCallback(name, oldValue, newValue) {
            this.params[name] = newValue;
            if (this.firstRendering) {
                this._render();
            }
        }
                
        /**
         * Handle connected-state.
         *
         * @return void
         */
        connectedCallback() {
            var iconPathEl = this.closest('[play-icon-path]');
            if (iconPathEl) {
                this.iconPath = iconPathEl.getAttribute('play-icon-path');
            } else {
                this.iconPath = '';
            }
            var iconTypeEl = this.closest('[play-icon-type]');
            if (iconTypeEl) {
                this.iconType = iconTypeEl.getAttribute('play-icon-type');
            } else {
                this.iconType = '';
            }
            this._render();
            this.firstRendering = true;
        }
                
        /**
         * Render icon.
         *
         * @return void
         */
        _render() {
            var _size = this.sizes[this.params.size] || '2';
            var _url = this.iconPath + '/' + (this.iconType ? this.iconType + '-' : '') + 'icons.svg';
            this.innerHTML = `<svg class="bi" width="${_size}em" height="${_size}em" fill="currentColor" style="font-size: initial">
                <use xlink:href="${_url}#${this.params.name}"/>
            </svg>`;
        }

    };
    
    return {
        icon,
    }
};
