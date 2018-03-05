class MyPromise {
	constructor() {
		const fn = arguments[0];
		this.status = 'pending';
		this.value = void 0;
		this.deferreds = [];
		// 触发第一次的回调
		fn(this.resolve, this.reject);
	}
	handle = deferred => {
		if (this.status === 'pending') {
			// 这是一个递归、当正在执行的时候，
			// 运行到then的时候会塞入队列中，
			// 执行完后，从队列中取一个继续执行
			this.deferreds.push(deferred);
			return;
		}
		// 若状态已经切换到fulfilled，设置回调函数
		let callback = this.status === 'fulfilled' ? deferred.onFulfilled : deferred.onRejected;
		// 若无回调
		if (callback === null) {
			callback = this.status === 'fulfilled' ? deferred.resolve : deferred.reject;
			callback(this.value);
			return;
		}
		try {
			const result = callback(this.value);
			// 执行回调函数，更新状态并重新赋给新值
			deferred.resolve(result);
		} catch (e) {
			// 报错踢出，更新状态
			deferred.reject(e);
		}
	};
	then = (onFulfilled, onRejected) => {
		//确保每次都返回promise
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
		// 检测返回值是不是promise
		if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
			const then = newValue.then;
			if (typeof then === 'function') {
				// 若是，重新触发回调
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
		// 定时确保执行顺序
		setTimeout(() => {
			this.deferreds.forEach(deferred => {
				this.handle(deferred);
			});
		}, 0);
	};
}

export default MyPromise;
