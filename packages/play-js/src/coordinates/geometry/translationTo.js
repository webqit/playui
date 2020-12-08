
/**
 * @imports
 */
import Rect from './Rect.js';

/**
 * Returns a new rect of source aligning with target.
 *
 * @param Rect|Element|Event|window 	source
 * @param Rect|Element|Event|window 	target
 * @param object                     	alignment
 *
 * @return Alignment
 */
export default function translationTo(source, target, alignment = {}) {
    var intersection = Rect.of(source).intersectionWith(target);
    var alignment = {};
    var $rect = {source, target, transformation: 'translation', ...intersection.source};
    var length = {x:'width', y:'height'};
    var start = {x:'left', y:'top'};
    var end = {x:'right', y:'bottom'};
    ['x', 'y'].forEach(axis => {
        if (options[axis] === false) {
            return;
        }
        var sourceLength = intersection.source[length[axis]/*height*/];
        // Distinguish and predicate
        alignment[axis] = parseDirective(options[axis] || '');
        switch(alignment[axis].keyword) {
            case 'before':
                // Pull beyond start
                $rect[start[axis]/*top*/] = - (intersection[start[axis]/*top*/] + sourceLength);
            break;
            case 'after':
                // Push beyond end
                $rect[start[axis]/*top*/] = intersection[end[axis]/*bottom*/] + sourceLength;
            break;
            case 'start':
                // Pull to start
                $rect[start[axis]/*top*/] = - intersection[start[axis]/*top*/];
            break;
            case 'end':
                // Push to end
                $rect[start[axis]/*top*/] = intersection[end[axis]/*bottom*/];
            break;
            default:
                // Align to center
                $rect[start[axis]/*top*/] = intersection.delta[axis];
        }
        // Apply predicates
        if (alignment[axis].predicates) {
            $rect[start[axis]/*top*/] += evalDirectivePredicates(alignment[axis].predicates, sourceLength);
        }
    });
    return $rect;
};

/** ------- */


/**
 * Parses a directive to obtain a placement keyword and alignment.
 *
 * @param string			 	expr
 *
 * @return object
 */
function parseDirective(expr) {
    var regPlacement = new RegExp('(before|after|start|end|center)', 'g');
    var regModifiers = new RegExp('[\-\+][0-9]+(%)?', 'g');
    return {
        keyword: (expr.match(regPlacement) || [])[0],
        predicates: expr.match(regModifiers.replace(/ /g, '')),
    };
};

/**
 * Sums a list of Mathematical expressions.
 *
 * @param array				 	alignment
 * @param number 				percentageContext
 *
 * @return number
 */
function evalDirectivePredicates(alignment, percentageContext) {
    return alignment.reduce((total, modifier) => total + (modifier.endsWith('%') 
        ? parseFloat(modifier) / 100 * percentageContext
        : parseFloat(modifier)
    ), 0);
};
