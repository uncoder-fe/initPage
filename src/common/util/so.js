// 观察者模式

// ╭─────────────╮  Fire Event  ╭──────────────╮
// │                │───────────>│                 │
// │   Subject      │               │   Observer      │
// │                │<───────────│                 │
// ╰─────────────╯  Subscribe   ╰──────────────╯
import _ from 'lodash';

class Subject {
	constructor() {
		this.listeners = [];
	}
	scanListeners = ob => {
		const { listeners } = this;
		const had = _.find(listeners, listener => _.isEqual(listener, ob));
		return had ? true : false;
	};
	register = ob => {
		if (!this.scanListeners(ob)) {
			this.listeners.push(ob);
		}
	};
	deregister = ob => {
		if (this.scanListeners(ob)) {
			_.remove(this.listeners, ob);
		}
	};
	notify_listeners = message => {
		const { listeners } = this;
		listeners.forEach(listener => {
			listener.notify(message);
		});
	};
}

class Observer {
	constructor(message, fn) {
		this.message = message;
		this.fn = fn;
	}
	notify = m => {
		const { message, fn } = this;
		// 这个消息我订阅了
		if (m == message) {
			console.log(`我订阅的消息是${message},我要触发的函数是${fn}`);
			fn();
		}
	};
}

var sb = new Subject();
var oba = new Observer('hi', () => { console.log("fuck,oba") });
var obb = new Observer('hi', () => { console.log("fuck,obb") });

sb.register(oba);
sb.register(oba);
sb.deregister(oba);

sb.register(obb);

sb.notify_listeners('hi');
