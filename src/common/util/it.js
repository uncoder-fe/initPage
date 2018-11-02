// 迭代器模式

class Iterator {
    constructor(arry) {
        this.arryList = arry;
        this.index = 0;
    }
    first = () => {
        return this.arryList[0];
    };
    next = () => {
        let ret = null;
        this.index++;
        if (this.index < this.arryList.length) {
            ret = this.arryList[this.index];
        }
        return ret;
    };
    isDone = () => {
        const { index, arryList } = this;
        return index >= arryList.length ? true : false;
    };
    CurrentItem = () => {
        return this.arryList[this.index];
    };
}

const arry = [1, 2, 3, 4, 5];

const f = new Iterator(arry);

console.log(f.first());
console.log(f.next());
console.log(f.isDone());
console.log(f.CurrentItem());
