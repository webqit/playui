
/**
 * @imports
 */
import Reflow from '../../chtml/Reflow.js';
import Anim from '../../chtml/anim/Anim.js';
import uiTranslateTo from '../../chtml/ui/translateTo.js';
import css from '../../chtml/css/css.js';
import cssWriteAsync from '../../chtml/css/writeAsync.js';
import on from '../../chtml/evt/on.js';
import off from '../../chtml/evt/off.js';

/**
 * ---------------------------
 * The Translate class
 * ---------------------------
 */
			
const Translate = class {

	/**
	 * Creates a Translation instance.
	 *
	 * @param HTMLElement			el
	 * @param object				params
	 *
	 * @return this
	 */
	constructor(el, params = {}) {
		this.el = el;
		// -----------------
		// Bind events
		// -----------------
		on(this.el, 'panstart', this._onPanStart.bind(this));
		on(this.el, 'panmove', this._onPanMove.bind(this));
		on(this.el, ['panend', 'pancancel'], this._onPanEnd.bind(this));
	}

	/**
	 * Initializes the Translation instance with a region.
	 *
	 * @param HTMLElement|window	region
	 * @param string				axis
	 *
	 * @return this
	 */
	with(region, axis = 'x') {
		this.region = region;
		this.axis = axis;
		// -----------------
		// Initialize
		// -----------------
		var init = () => {
			var animParams = _inherit({duration:400}, this.$.params.animation || {});
			Reflow.instance().onread(() => {
				var translate = uiTranslateTo(this.el, this.region, {x:'end', y:'center'});
				this.moveableDistance = translate.to.translate[this.axis === 'x' ? 0 : 1];
				this.anim = new Anim(this.el, [
					{transform: translate.current.from},
					{transform: translate.to}
				], animParams);
				this.anim.pause();
				this.currentDistance = 0;
				this.progress = 0;
			});
		};
		// -----------------
		if (this.$params.startupReset) {
			Reflow.instance().onread(() => {
				var startup = uiTranslateTo(this.el, this.region, {x:'start', y:'center'});
				cssWriteAsync(this.el, {transform: startup.to}).then(init());
			});
		} else {
			init();
		}
	}
	
	/**
	 * Handle pan start.
	 *
	 * @param Event				e
	 *
	 * @return void
	 */
	_onPanStart(e) {
	}

	/**
	 * Handle pan move.
	 *
	 * @param Event				e
	 *
	 * @return void
	 */
	_onPanMove(e) {
		this.progress = (this.currentDistance + e.deltaX) / this.moveableDistance;
		this.anim.seek(this.progress);
	}
	
	/**
	 * Handle pan end.
	 *
	 * @param Event				e
	 *
	 * @return void
	 */
	_onPanEnd(e) {
		this.progress = this.anim.progress();
		this.currentDistance = this.progress * this.moveableDistance;
		if (this.progress > 0.5) {
			this.anim.play().then(() => {
				this.progress = 1;
				this.currentDistance = this.moveableDistance;
				this.anim.pause();
			});
		} else {
			this.anim.reverse().play().then(() => {
				this.progress = 0;
				this.currentDistance = 0;
				this.anim.reverse().pause();
			});
		}
		/**
		*/
	}
};

/**
 * @exports
 */
export default Translate;