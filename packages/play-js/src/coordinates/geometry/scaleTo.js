
/**
 * @imports
 */
import Rect from './Rect.js';

/**
 * Returns a new rect of rect1 scaled to rect2.
 *
 * @param Rect|Element|Event|window 	source
 * @param Rect|Element|Event|window 	target
 * @param object                     	origins
 *
 * @return Scale
 */
export default function scaleTo(source, target, origins = {}) {
    source = Rect.of(source);
    target = Rect.of(target);
    var $rect = {source, target, transformation: 'scale', ...source};
    $rect.left -= (target.width - source.width) / 2;
    $rect.top -= (target.height - source.height) / 2;
    return $rect;
};