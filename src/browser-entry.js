
/**
 * @imports
 */
import { build } from './build.js';
import * as modules from './index.js';

// As globals
const $ = build(window, modules, 2);
window.WQ.$ = $;