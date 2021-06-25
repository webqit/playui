
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
	 * @param string|array|object	props
	 * @param function	 			readCallback
	 * @param function	 			writeCallback
	 *
	 * @return void
	 */
	constructor(el, props, readCallback, writeCallback) {
		this.el = el;
		this.props = _arrFrom(props);
		this.readCallback = readCallback;
		this.writeCallback = writeCallback;
		this.$savepoints = [];
	}
	
	/**
	 * Creates a savepoint that can be later rolled back to.
	 *
	 * @return Promise|mixed
	 */
	savepoint() {
		var readerDisposition = this.readCallback(this.el, this.props);
		if (readerDisposition instanceof Promise) {
			return readerDisposition.then(record => {
				if (_isObject(record)) {
					this.$savepoints.push(record);
				}
				return record;
			});
		}
		if (_isObject(readerDisposition)) {
			this.$savepoints.push(readerDisposition);
			return readerDisposition;
		}
	}
	
	/**
	 * Calls writeCallback.
	 *
	 * @param object	record
	 * 
	 * @return Promise|mixed
	 */
	apply(record) {
		return this.writeCallback(this.el, record);
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
	 * @param bool	preserveCurrentState
	 *
	 * @return void}Promise
	 */
	rollback(savepoint = 0, preserveCurrentState = false) {
		if (!_isNumeric(savepoint)) {
			throw new Error('A valid transaction ID transaction must be provided!');
		}
		// -----------------------
		var getRollbackData = currentState => {
			var savepoints = this.$savepoints.splice(savepoint);
			// ToSavepoint is our target point
			var toSavepoint = savepoints.shift();
			if (!toSavepoint) {
				return {};
			}
			// FromSavepoint is our last point before current,
			// which we need to validate with current
			var latestTransactionRecord = savepoints.pop();
			var record = {};
			// Restore only what's applicable.
			this.props.forEach(prop => {
				// We'll restore only values that have
				// NOT changed from what we earlier RECORDED...
				if (preserveCurrentState && latestTransactionRecord && currentState[prop] !== latestTransactionRecord[prop]) {
					return
				}
				// We'll restore only values that
				// HAVE changed from what we earlier RECORDED...
				if (currentState[prop] !== toSavepoint[prop]) {
					record[prop] = toSavepoint[prop];
				}
			});
			return record;
		};
		// -----------------------
		var currentState = preserveCurrentState ? this.readCallback(this.el, this.props) : {};
		if (currentState instanceof Promise) {
			return currentState.then(currentState => this.apply(getRollbackData(currentState)));
		}
		return this.apply(getRollbackData(currentState));
	}
	
	/**
	 * Returns the number of pushes.
	 *
	 * @return int
	 */
	get length() {
		return this.$savepoints.length;
	}
}