class MyPromise {
	constructor() {
		const fn = arguments[0];
		this.status = 'pending';
		this.value = void 0;
		this.deferreds = [];
		fn(this.resolve, this.reject);
	}
	handle = deferred => {
		if (this.status === 'pending') {
			this.deferreds.push(deferred);
			return;
		}
		let callback = this.status === 'fulfilled' ? deferred.onFulfilled : deferred.onRejected;
		if (callback === null) {
			callback = this.status === 'fulfilled' ? deferred.resolve : deferred.reject;
			callback(this.value);
			return;
		}
		try {
			const result = callback(this.value);
			deferred.resolve(result);
		} catch (e) {
			deferred.reject(e);
		}
	};
	then = (onFulfilled, onRejected) => {
		return new MyPromise((resolve, reject) => {
			this.handle({
				onFulfilled: onFulfilled || null,
				onRejected: onRejected || null,
				resolve: resolve,
				reject: reject,
			});
		});
	};
	resolve = newValue => {
		debugger;
		if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
			const then = newValue.then;
			if (typeof then === 'function') {
				then.call(newValue, this.resolve, this.reject);
				return;
			}
		}
		this.status = 'fulfilled';
		this.value = newValue;
		this.finale();
	};

	reject = reason => {
		this.status = 'rejected';
		this.value = reason;
		this.finale();
	};

	finale = () => {
		setTimeout(() => {
			console.log(this.deferreds);
			this.deferreds.forEach(deferred => {
				this.handle(deferred);
			});
		}, 0);
	};
}

export default MyPromise;
