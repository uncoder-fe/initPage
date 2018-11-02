// 发布-订阅，架构模式

// 相当于 EventEmitter，并且是将值或事件多路推送给多个 Observer 的唯一方式
class Subject {
    notify = (message, cb) => {
        cb(message);
    };
}
// 表示一个概念，这个概念是一个可调用的未来值或事件的集合。
class Observable {
    constructor() {
        this.listeners = new Set([]);
    }
    register = ob => {
        if (!this.scanListeners.has(ob)) {
            this.listeners.add(ob);
        }
    };
    deregister = ob => {
        if (this.scanListeners(ob)) {
            this.scanListeners.delete(ob);
        }
    };
    publish = message => {
        const { listeners } = this;
        listeners.forEach(listener => {
            listener.notify(message);
        });
    };
}
// 一个回调函数的集合，它知道如何去监听由 Observable 提供的值。
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
var sbc = new Observable();
var oba = new Observer('hi', () => {
    console.log('fuck,oba');
});
var obb = new Observer('hi', () => {
    console.log('fuck,obb');
});

sbc.register(oba);
sbc.register(oba);
sbc.deregister(oba);
sbc.register(obb);

sb.notify('hi', () => {
    const message = arguments[0];
    sbc.publish(message);
});
