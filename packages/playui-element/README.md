# PlayUI Element

<!-- BADGES/ -->

<span class="badge-npmversion"><a href="https://npmjs.org/package/@webqit/playui-element" title="View this project on NPM"><img src="https://img.shields.io/npm/v/@webqit/playui-element.svg" alt="NPM version" /></a></span> <span class="badge-npmdownloads"><a href="https://npmjs.org/package/@webqit/playui-element" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/@webqit/playui-element.svg" alt="NPM downloads" /></a></span>

<!-- /BADGES -->

(**Part of the [Play UI](https://github.com/webqit/playui) suite**.)

Install in Nodejs:

```shell
npm i @webqit/playui-element
```

```js
import PlayElement from './PlayElement.js';
```

Embeded in HTML:

```html
<!-- Add the OOHTML dependency -->
<script src="https://unpkg.com/@webqit/oohtml/dist/main.js"></script>
<script src="https://unpkg.com/@webqit/playui-element/dist/main.js"></script>
```

Build Custom elements with it:

```js
const { Observer, PlayElement } = webqit;

// Anatomy
const localVar = 'Initial local value';
window.globalVar = 'Initial global value';
customElements.define( 'my-element', class extends PlayElement( HTMLElement ) {
    static get reflexFunctions() {
        return [ 'render' ]; // List of methods that should be transformed to "reflex" functions
    }
    static get reflexFunctionsEnv() {
        return { localVar }; // How to make the render() function see local variables.
    }
    prop = 'Initial local value';
    render() {
        console.log( 'Instance prop:', this.prop );
        console.log( 'Local variable', localVar );
        console.log( 'Global variable', globalVar );
    }
} );
```

```html
<my-element></my-element>
```

```js
// The automatic reactivity part
const elem = document.querySelector( 'my-element' );
setTimeout( () => {
    Observer.set( elem, 'prop', 'New local value' );
    Observer.set( globalThis, 'globalVar', 'New global value' );
}, 5000 );
```