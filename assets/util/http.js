/*
 * @Date: 2017-12-29 10:58:09
 * @Last Modified time: 2017-12-29 10:58:09
 * 创建唯一实例
 */

class Http {
	constructor() {
		console.log('我被创建了')
	}
	get() {
		console.log('say get')
	}
}
export default new Http()
