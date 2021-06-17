
/**
 * @imports
 */
import * as css from './css/index.js';
import * as dom from './dom/index.js';
import * as ui from './ui/index.js';
import { build } from './util.js';
   
// As globals
export default function(params = {}) {
    return build({
        css,
        dom,
        ui,
    }, 1, this, params);
}

 /**
  * @exports
  */
 export {
     css,
     dom,
     ui,
 }
