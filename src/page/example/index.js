import Toast from '../../components/toast';
import Alert from '../../components/alert';
import Test from './hello-world';
import MathPage from './mathjax-test';
import Tree from '../../components/tree';
import HandWriting from '../../components/handwriting';
import * as Api from 'common/api';
import './index.less';

require('core-js/fn/array/find');

class Index extends React.Component {
	constructor() {
		super();
		this.state = {
			hkey: 1,
			handWrtingData: [],
		};
	}
	handleLazyLoad() {
		import(/* webpackChunkName: "lazyModule" */ '../../common/lazy-module.js').then(module => {
			const sayFn = module.default;
			sayFn();
		});
	}
	handleJuqery() {
		this.setState({
			hkey: ++this.state.hkey,
			handWrtingData: this.state.handWrtingData,
		});
		return;
		Alert.confirm({
			type: '娜娜',
			title: '我是标题',
			subTitle: '我是副标题',
			okText: '确定',
			onOk: () => {
				console.log('确定啦');
			},
			cancelText: '取消',
			onCancel: () => {
				console.log('取消啦');
			},
		});
		console.log('jquery选择器测试', jQuery('#app'));
	}
	handleToast(event) {
		let string = [1, 3, 4, 5, 6].find(item => item === 3);
		Toast.info(`toast测试内容${string}`);
		console.log('Dom的event', event.target.innerHTML);
	}
	async componentDidMount() {
		const res = await Api.test({id: 1});
		console.log('res', res);
		$.getJSON('./data.json', json => {
			const data = json.beautificated_pages[0].strokes;
			this.setState({
				hkey: 1,
				handWrtingData: data,
			});
		});
	}
	render() {
		const {hkey, handWrtingData} = this.state;
		return (
			<div>
				<Test text="hello world" />
				<button onClick={() => this.handleLazyLoad()}>click me to load lazy module</button>
				<button onClick={() => this.handleJuqery()}>click me to check jquery</button>
				<button onClick={this.handleToast}>click me to toast</button>
				<div>{/* <MathPage /> */}</div>
				<div>{/* <Tree /> */}</div>
				<div>
					<HandWriting data={handWrtingData.slice(0, 2)} hkey={hkey} />
					<HandWriting data={handWrtingData.slice(0, 2)} hkey={hkey} />
				</div>
			</div>
		);
	}
}

export default Index;
