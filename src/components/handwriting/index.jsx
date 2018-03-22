import './index.less';
import ControlPanel from './control-panel';

class HandWriting extends React.Component {
	constructor() {
		super();
		this.ratio = window.devicePixelRatio;
		this.scale = 0.5 * this.ratio;
		this.canvasCache = null;
		this.canvasHeigth = null;
		this.canvasWidth = null;
		this.rafid = null;
		this.originData = [];
		this.state = {
			step: 0,
			speed: 1,
			range: 0
		};
	}
	// 计算最大边界
	_getImageSize = data => {
		let maxHeight = 0;
		let maxWidth = 0;
		for (let i = 0; i < data.length; i++) {
			const points = data[i].points.split(',');
			for (let j = 0; j < points.length; j++) {
				const point = points[j].split(' ');
				const x = parseInt(point[0]);
				const y = parseInt(point[1]);
				if (x > maxWidth) {
					maxWidth = x;
				}
				if (y > maxHeight) {
					maxHeight = y;
				}
			}
		}
		return {
			width: maxWidth + 10,
			height: maxHeight + 10
		};
	};
	// 初始化
	_init = async () => {
		let { scale, originData } = this;
		let { speed, range } = this.state;
		// console.log(speed, range)
		if (Object.prototype.toString.call(originData) !== '[object Array]' || originData.length <= 0) {
			console.log('无笔迹');
			return;
		}
		const data = originData;
		const size = this._getImageSize(data);
		this.canvasHeigth = size.height * scale;
		this.canvasWidth = size.width * scale;
		// canvas
		const myCanvas = document.createElement('canvas');
		myCanvas.setAttribute('height', this.canvasHeigth);
		myCanvas.setAttribute('width', this.canvasWidth);
		// 确保高清无码
		myCanvas.style.width = this.canvasWidth / this.ratio + 'px';
		this.myCanvasContainer.appendChild(myCanvas);

		// ctx
		const ctx = myCanvas.getContext('2d');
		ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeigth);
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2 * scale;
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		// 数据切割
		const fg = parseInt(data.length * (range / 100));
		const _staticData = data.slice(0, fg);
		const _animateData = data.slice(fg, data.length);
		// 静态
		this._disAnimate(ctx, _staticData);
		// 动态
		for (let i = 0; i < _animateData.length; i++) {
			const line = _animateData[i].points.split(',');
			// 默认
			let tick = 16;
			// 第两个
			if (i > 0) {
				const duration = parseInt(_animateData[i].t2 - _animateData[i].t1);
				const tt = parseInt(duration / line.length);
				if (tt > 30) {
					tick = 16;
				} else {
					tick = tt;
				}
			}
			// 清空画布
			ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeigth);
			// 静态的
			if (this.canvasCache) {
				// debugger
				ctx.putImageData(this.canvasCache, 0, 0);
			}
			await new Promise((resolve, reject) => {
				// 动态的
				this._animate(ctx, line, resolve, tick, speed);
				// 更新进度条
				const { range, step } = this.state;
				let nmb = range + step;
				if (_staticData.length == 0 && i == 0) {
					nmb = 0;
				} else if (i == _animateData.length - 1) {
					nmb = 100;
				} else {
					nmb = range + step;
				}
				this.setState({
					range: nmb
				});
			});
		}
	};
	// 静态渲染
	_disAnimate = (ctx, json) => {
		const { scale, canvasWidth, canvasHeigth } = this;
		json.forEach(item => {
			const line = item.points.split(',');
			for (let i = 0; i < line.length; i += 3) {
				if (line[i] && line[i + 1] && line[i + 2]) {
					const control1 = line[i].split(' ');
					const control2 = line[i + 1].split(' ');
					const stop = line[i + 2].split(' ');
					// 向前补点
					ctx.beginPath();
					const startPoint = line[i == 0 ? 0 : i - 1].split(' ');
					ctx.moveTo(startPoint[0] * scale, startPoint[1] * scale);
					ctx.lineTo(control1[0] * scale, control1[1] * scale);
					ctx.bezierCurveTo(
						control1[0] * scale,
						control1[1] * scale,
						control2[0] * scale,
						control2[1] * scale,
						stop[0] * scale,
						stop[1] * scale
					);
					ctx.closePath();
					ctx.stroke();
				}
			}
		});
		this.canvasCache = ctx.getImageData(0, 0, canvasWidth, canvasHeigth);
	};
	// 动态渲染
	_animate = (ctx, data, resolve, tick, speed) => {
		const { scale, canvasWidth, canvasHeigth } = this;
		// index
		let startIndex = 1;
		let oldTime = Date.now();
		this.rafid = window.requestAnimationFrame(renderLoop.bind(this));
		function renderLoop() {
			const newTime = Date.now();
			let points = data.slice((startIndex - 1) * 3 * speed, startIndex * 3 * speed);
			// console.log(points, (startIndex - 1) * 3 * speed, startIndex * 3 * speed);
			if (newTime - oldTime > tick) {
				oldTime = newTime;
				if (startIndex > data.length / (3 * speed) && points.length <= 0) {
					window.cancelAnimationFrame(this.rafid);
					this.canvasCache = ctx.getImageData(0, 0, canvasWidth, canvasHeigth);
					resolve('next');
				} else {
					// 检测长度
					if (points.length >= 3) {
						//贝塞尔曲线
						for (let i = 0; i < points.length; i += 3) {
							if (points[i] && points[i + 1] && points[i + 2]) {
								const control1 = points[i].split(' ');
								const control2 = points[i + 1].split(' ');
								const stop = points[i + 2].split(' ');
								ctx.beginPath();
								// 向前补点
								const iii = data.indexOf(points[i]) == 0 ? 1 : data.indexOf(points[i]);
								const startPoint = data[iii - 1].split(' ');
								ctx.moveTo(startPoint[0] * scale, startPoint[1] * scale);
								ctx.lineTo(control1[0] * scale, control1[1] * scale);
								ctx.bezierCurveTo(
									control1[0] * scale,
									control1[1] * scale,
									control2[0] * scale,
									control2[1] * scale,
									stop[0] * scale,
									stop[1] * scale
								);
								ctx.closePath();
								ctx.stroke();
							} else {
								// console.log("fuck 丢了1个点，不管了")
							}
						}
					} else {
						let control1;
						let control2;
						let stop;
						if (points.length == 2) {
							control1 = data[(startIndex - 1) * 3 * speed - 1].split(' ');
							control2 = points[0].split(' ');
							stop = points[1].split(' ');
						} else {
							control1 = data[(startIndex - 1) * 3 * speed - 2].split(' ');
							control2 = data[(startIndex - 1) * 3 * speed - 1].split(' ');
							stop = points[0].split(' ');
						}
						ctx.beginPath();
						ctx.bezierCurveTo(
							control1[0] * scale,
							control1[1] * scale,
							control2[0] * scale,
							control2[1] * scale,
							stop[0] * scale,
							stop[1] * scale
						);
						ctx.closePath();
						ctx.stroke();
					}
					startIndex++;
					this.rafid = window.requestAnimationFrame(renderLoop.bind(this));
				}
			} else {
				this.rafid = window.requestAnimationFrame(renderLoop.bind(this));
			}
		}
	};
	// 组件状态销毁
	_destory = () => {
		// 销毁当前动画
		window.cancelAnimationFrame(this.rafid);
		// 销毁缓存
		this.canvasCache = null;
		// 销毁canvas
		this.myCanvasContainer.innerHTML = '';
	};
	// 控制面板状态改变
	_changeAnimate = data => {
		// console.log("data", data);
		this._destory();
		const { speed, range } = data;
		this.setState({ speed, range }, () => {
			this._init();
		});
	};
	// 组件卸载，自动卸载不能删除定时器等
	componentWillUnmount() {
		this._destory();
	}
	// 当组件不使用key，或者key不变时
	componentWillReceiveProps(nextProps) {
		this._destory();
		const { data } = nextProps;
		// 缓存原始数据
		this.originData = data;
		if (data.length > 0) {
			// 暂时只考虑100画
			const step = 100 / data.length;
			this.setState({ step }, () => {
				this._init();
			});
		}
	}
	// 当组件通过key销毁时，重新创建
	componentDidMount() {
		const { data } = this.props;
		// 缓存原始数据
		this.originData = data;
		if (data.length > 0) {
			// 暂时只考虑100画
			const step = 100 / data.length;
			this.setState({ step }, () => {
				this._init();
			});
		}
	}
	render() {
		const { speed, range, step } = this.state;
		return (
			<div>
				<div
					ref={el => {
						this.myCanvasContainer = el;
					}}
				/>
				<ControlPanel speed={speed} range={range} step={step} fn={this._changeAnimate} />
			</div>
		);
	}
}
export default HandWriting;
