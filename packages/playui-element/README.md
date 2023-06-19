# PlayUI Element

<!-- BADGES/ -->

<span class="badge-npmversion"><a href="https://npmjs.org/package/@webqit/playui-element" title="View this project on NPM"><img src="https://img.shields.io/npm/v/@webqit/playui-element.svg" alt="NPM version" /></a></span> <span class="badge-npmdownloads"><a href="https://npmjs.org/package/@webqit/playui-element" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/@webqit/playui-element.svg" alt="NPM downloads" /></a></span>

<!-- /BADGES -->

Build custom elements with no ergonomic or mental overheads! Playui Element lets you leverage technologies like [Reflex Functions](https://github.com/webqit/reflex-functions), [Observer API](https://github.com/webqit/observer) and [OOHTML](https://github.com/webqit/oohtml) to write reactive logic without a compile step or any manual work!

<details><summary>Load from a CDN</summary>

```html
<!-- Add the OOHTML dependency -->
<script src="https://unpkg.com/@webqit/oohtml/dist/main.js"></script>
<script src="https://unpkg.com/@webqit/playui-element/dist/main.js"></script>
```

```js
const { Observer, PlayElement } = window.webqit;
```

</details>

<details><summary>Install from NPM</summary>

```shell
npm i @webqit/playui-element @webqit/reflex-functions @webqit/observer
```

```js
import { PlayElementClassFactory } from '@webqit/playui-element';
import { ReflexFunction } from '@webqit/reflex-function';
import Observer from '@webqit/observer';
// Define PlayElement
function PlayElement( HTMLElement ) {
    return PlayElementClassFactory( HTMLElement, ReflexFunction, Observer );
}
```

</details>

Build Custom elements with it:

```js
// Anatomy
const localVar = 'Initial local value';
window.globalVar = 'Initial global value';
customElements.define( 'my-element', class extends PlayElement( HTMLElement ) {

    // List of methods that should be transformed to "reflex" functions
    static get reflexFunctions() {
        return [ 'render' ];
    }

    // How to make the render() function see local variables.
    static get reflexFunctionsEnv() {
        return { localVar };
    }

    prop = 'Initial local value';
    render() {
        console.log( 'Global variable', globalVar );
        console.log( 'Local variable', localVar );
        console.log( 'Instance prop:', this.prop );
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