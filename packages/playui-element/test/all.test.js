
/**
 * @imports
 */
import { expect } from 'chai';
import { delay, createDocument } from '../../../test/index.js';
import { PlayElement, Observer } from '../src/index.js';

describe(`PlayElement`, function() {

    describe( `PlayElement.extend()...`, function() {

        const head = ``, body = `<my-element></my-element>`;
        const window = createDocument( head, body ), { document } = window;

        // --------------
        class MyElement extends PlayElement( window.HTMLElement ) {
            static get contractFunctions() {
                return [ 'render' ];
            }
            static get contractFunctionsEnv() {
                return { results };
            }
            async render() {
                results.push( this.newContent || 'Hello from Subscript!' );
            }
        }
        const results = [];
        window.customElements.define( 'my-element', MyElement );
        const myElement = document.querySelector( 'my-element' );
        // --------------

        it ( `Just asking "instanceof" for custom elements created from PlayElement...`, async function() {
            expect( myElement ).to.instanceOf( MyElement );
        } );

        const token0 = 'Hello from Subscript!';
        it ( `"myElement.render()" should add string "${ token0 }" to result array...`, async function() {
            expect( results ).to.be.an( 'array' ).of.length( 1 );
            expect( results[ 0 ] ).to.eq( token0 );
        } );

        const token1 = 'Hello again from Subscript!';
        it ( `"myElement.render()" should add new string "${ token1 }" to result array - as observed via the Observer API...`, async function() {
            Observer.set( myElement, 'newContent', token1 );
            expect( results ).to.be.an( 'array' ).of.length( 2 );
            expect( results[ 1 ] ).to.eq( token1 );
        } );

        it ( `"myElement.render()" should no more be reactive on element being removed from DOM...`, async function() {
            myElement.remove();
            Observer.set( myElement, 'newContent', token0 );
            expect( results ).to.be.an( 'array' ).of.length( 2 );
            expect( results[ 1 ] ).to.eq( token1 );
        } );

        const token2 = 'Hello yet again from Subscript!';
        it ( `"myElement.render()" should again be reactive on element being added to the DOM...`, async function() {
            document.body.appendChild( myElement );
            await delay( 0 );
            expect( results ).to.be.an( 'array' ).of.length( 3 );
            expect( results[ 2 ] ).to.eq( token0 );
            Observer.set( myElement, 'newContent', token2 );
            expect( results ).to.be.an( 'array' ).of.length( 4 );
            expect( results[ 3 ] ).to.eq( token2 );
        } );

    } );

} );
