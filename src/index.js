
/**
 * @imports
 */
import * as animation from './animation/index.js';
import * as coordinates from './coordinates/index.js';
import * as css from './css/index.js';
import * as dom from './dom/index.js';
import * as interaction from './interaction/index.js';
import { build } from './util.js';
   
// As globals
export default function(context = {}) {
    return build({
        animation,
        coordinates,
        css,
        dom,
        interaction,
    }, 1, context);
}

 /**
  * @exports
  */
 export {
     animation,
     coordinates,
     css,
     dom,
     interaction,
 }
