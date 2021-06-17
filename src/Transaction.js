
/**
 * @imports
 */
import _isObject from '@webqit/util/js/isObject.js';
import _isNumeric from '@webqit/util/js/isNumeric.js';
import _arrFrom from '@webqit/util/arr/from.js';

/**
 * ----------------------------------------
 * Establishes an operatiom that can be rolledback
 * without altering similar operation by other code.
 * ----------------------------------------
 */
 
export default class Transaction {

	/**
	 * Creates a new transaction instance.
	 *
	 * If a callback is provided, it synces the entire operation with Reflow's normal read/write cycles.
	 *
	 * @param Element				el 
	 * @param string|array|object	params
	 * @param function	 			readCallback
	 * @param function	 			writeCallback
	 *
	 * @return void
	 */
	constructor(el, params, readCallback, writeCallback) {
		this.el = el;
		this.params = _arrFrom(params);
		this.readCallback = readCallback;
		this.writeCallback = writeCallback;
		this.$savepoints = [];
	}
	
	/**
	 * Creates a savepoint that can be later rolled back to.
	 *
	 * @return Promise|mixed
	 */
	save() {
		var readerDisposition = this.readCallback(this.el, this.params);
		if (readerDisposition instanceof Promise) {
			return readerDisposition.then(data => this.$savepoints.push(data));
		}
		if (_isObject(readerDisposition)) {
			return this.$savepoints.push(readerDisposition);
		}
	}
	
	/**
	 * Marks recods a commited.
	 *
	 * @param int	savepoint
	 *
	 * @return this
	 */
	commit(savepoint = 0) {
		for (var i = 0; i <= savepoint && savepoint < this.$savepoints.length; i ++) {
			this.$savepoints[i] = null;
		}
		return this;
	}
	
	/**
	 * Rolls the transaction back to a savepoint.
	 *
	 * @param int	savepoint
	 *
	 * @return void}Promise
	 */
	rollback(savepoint = 0) {
		if (!_isNumeric(savepoint)) {
			throw new Error('A valid transaction ID transaction must be provided!');
		}
		// -----------------------
		var getRollbackData = currentRead => {
			var savepoints = this.$savepoints.splice(savepoint);
			// ToSavepoint is our target point
			var toSavepoint = savepoints.shift();
			if (!toSavepoint) {
				return {};
			}
			// FromSavepoint is our last point before current,
			// which we need to validate with current
			var fromSavepoint = savepoints.pop();
			var data = {};
			// Restore only what's applicable.
			this.params.forEach(param => {
				// We'll restore only values that have
				// NOT changed from what we earlier COMMITTED...
				if (fromSavepoint && currentRead[param] !== fromSavepoint[param]) {
					return
				}
				// We'll restore only values that
				// HAVE changed from what we earlier RECORDED...
				if (currentRead[param] !== toSavepoint[param]) {
					data[param] = toSavepoint[param];
				}
			});
			return data;
		};
		// -----------------------
		var currentRead = this.readCallback(this.el, this.params);
		if (currentRead instanceof Promise) {
			return currentRead.then(currentRead => this.writeCallback(this.el, getRollbackData(currentRead)));
		}
		return this.writeCallback(this.el, getRollbackData(currentRead));
	}
	
	/**
	 * Returns the number of pushes.
	 *
	 * @return int
	 */
	depth() {
		return this.$savepoints.length;
	}
};