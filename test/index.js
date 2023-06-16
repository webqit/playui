/**
 * @imports
 */
import { createWindow } from '@webqit/oohtml-ssr';

export function delay( duration, callback = undefined ) {
    return new Promise( res => {
        setTimeout( () => res( callback && callback() ), duration );
    } );
}

export function createDocument( head = '', body = '', callback = null, ) {
    // -------
    const skeletonDoc = `
    <!DOCTYPE html>
    <html>
        <head>
            <script ssr src="https://unpkg.com/@webqit/oohtml/dist/main.js"></script>
            ${ head }
        </head>
        <body>${ body }</body>
    </html>`;
    // --------
    // TODO: Proper indentation for pretty-printing
    return createWindow( skeletonDoc, {
        url: 'http://localhost',
        beforeParse( window ) {
            if ( callback ) callback( window );
        }
    } );
}