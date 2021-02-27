
/**
 * @imports
 */
import API from './API.js';

/**
 * ---------------------------
 * The Ani2 class
 * ---------------------------
 */
			
export default class Ani2 extends API {
	
	/**
	 * Creates an amiation from
	 * any of keyframes, CSS keyframe name, or CSS object.
	 *
	 * @param Element				el
	 * @param function				callback
	 * @param object				params
	 *
	 * @return this
	 */
	constructor(el, callback, params = {}) {
		super(el, callback, params);
		var sym = Symbol.for('play-js-ani2');
		// -----------------------------
		// The state...
		// -----------------------------
		const _this = this;
		this.$.anim = {
			el,
			timing: {
				currentTime: 0,
				delay: _this.$.params.delay,
				duration: _this.$.params.duration,
				endDelay: _this.$.params.endDelay,
				calculate() {
					var active = this.state === 'playing' || this.state === 'paused';
					var delay = active ? this.delay : _this.$.params.delay,
						duration = active ? this.duration : _this.$.params.duration,
						endDelay = active ? this.endDelay : _this.$.params.endDelay;
					var currentDelay = delay,
						totalDuration = currentDelay + duration,
						totalTiming = totalDuration + endDelay;
					this.delay = Math.max(0, Math.min(delay, this.currentTime >= currentDelay ? 0 : currentDelay - this.currentTime));
					this.duration = Math.max(0, Math.min(duration, this.currentTime >= totalDuration ? 0 : totalDuration - this.currentTime));
					this.endDelay = Math.max(0, Math.min(endDelay, this.currentTime >= totalTiming ? 0 : totalTiming - this.currentTime));
				},
				start(callback) {
					if (_this.$.anim.el[sym]) {
						_this.$.anim.el[sym].finish();
					}
					_this.$.anim.el[sym] = _this.$.anim;
					// ---------------
					this.state = 'playing';
					this.calculate();
					this.interval = setInterval(() => {
						if (this.currentTime === this.delay) {
							callback(0);
						}
						if (this.currentTime === this.delay + this.duration) {
							callback(1);
						}
						if (this.currentTime === this.delay + this.duration + this.endDelay) {
							this.state = 'finished';
							this.stop();
							callback(2);
							this.currentTime = 0;
						} else {
							this.currentTime ++;
						}
					}, 1);
				},
				stop() {
					// Interval is cleared at the entire end
					// duration: delay + duration + endDelay
					clearInterval(this.interval);
				},
			},

			set currentTime(currentTime) {
				this.timing.currentTime = currentTime;
				if (this.timing.state === 'playing') {
					this.timing.stop();
					this.play();
				}
			},

			get currentTime() {
				return this.timing.currentTime;
			},

			_callBegin() {
				return callback(this.el, 'begin', this.reversed, this.currentTime);
			},

			_callPause() {
				return callback(this.el, 'pause', this.reversed, this.currentTime);
			},

			_callEnd() {
				return callback(this.el, 'end', this.reversed, this.currentTime);
			},

			play() {
				this.timing.start(phase => {
					if (phase === 0) {
						this._callBegin();
					} else if (phase === 1) {
						this._callEnd();
					} else if (phase === 2) {
						_this.$.callFinish();
					}
				});
			},

			reverse() {
				this.reversed = !this.reversed;
				if (this.timing.state === 'playing') {
					this.timing.stop();
					this.play();
				}
			},

			pause() {
				// Is pause supported by handler?
				if (this._callPause() !== false) {
					this.timing.state = 'paused';
					this.timing.stop();
				}
			},			

			finish() {
				this.timing.state = 'finished';
				this.timing.stop();
				this._callEnd();
				_this.$.callFinish();
			},

			cancel() {
				this.timing.state = 'cancelled';
				this.timing.stop();
				_this.$.callCancel();
			},
		};

		// A little polifyll
		if (!this.$.anim.effect) {
			this.$.anim.effect = {};
		}
		if (!this.$.anim.effect.duration) {
			this.$.anim.effect.duration = this.$.params.delay + this.$.params.duration + this.$.params.endDelay;
		}
	}
	
	/**
	 * Animation-ready callback.
	 *
	 * @param function		succes
	 * @param function		error
	 *
	 * @return void
	 */
	ready(succes, error) {
		succes(this.$.anim, this.$.params);
	}
};