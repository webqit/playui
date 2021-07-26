
/**
 * Rotation UIRect.
 */
export default UIRect => class Rotation extends UIRect { 

    /**
     * Manipulates an element's translate.translate to place it with another element.
     *
     * @param object    params
     *
     * @return Array
     */
    css(params = {}) {
        var $css;
        $css = [
            {tansform: new TransformRule({rotate: 0,})},
            {tansform: new TransformRule({rotate: 0,})},
        ];
        $css.progress = {};
        $css.abs = [
            {tansform: new TransformRule({rotate: 0,})},
            {tansform: new TransformRule({rotate: 0,})},
        ];
        var activeTransform = cssSync.call(this.params.CNTXT, this.node, 'transform');
        $css[0].tansform.rotate = activeTransform.rotate;
        $css[1].tansform.rotate = this.angle;
        // ----------------
        $css.progress = Math.abs(activeTransform.rotate / this.angle);
        // ----------------
        $css.abs[0].tansform.rotate = 0;
        $css.abs[1].tansform.rotate = this.angle + activeTransform.rotate;
        return $css;
    }
}
