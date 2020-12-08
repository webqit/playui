
/**
 * @imports
 */
import DOMInit from '@webqit/browser-pie/src/dom/index.js';
import { build } from '../../../src/build.js';
import * as modules from './index.js';

// As globals
const DOM = DOMInit(window);
window.WQ.$ = build(DOM, modules, 1);