
/**
 * @imports
 */
import { build } from '../../../src/build.js';
import * as modules from './index.js';

// As globals
const $ = build(window, modules, 1);
window.WQ.$ = $;