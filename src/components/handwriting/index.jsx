import './index.less';

class HandWriting extends React.Component {
	constructor() {
		super();
		this.ratio = window.devicePixelRatio;
		this.scale = 0.5 * this.ratio;
		this.canvasCache = null;
		this.canvasHeigth = null;
		this.canvasWidth = null;
		this.rafid = null;
	}
	_getImageSize = data => {
		let maxHeight = 0;
		let maxWidth = 0;
		let count = 0;
		for (let i = 0; i < data.length; i++) {
			const points = data[i].points.split(',');
			count += points.length;
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
			average: parseInt(count / data.length) || 20,
			width: maxWidth + 10,
			height: maxHeight + 10,
		};
	};
	_init = async data => {
		let {scale} = this;
		const size = this._getImageSize(data);
		const averageLineLength = size.average;
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
		for (let i = 0; i < data.length; i++) {
			const line = data[i].points.split(',');
			// 默认
			let tick = line.length > averageLineLength ? averageLineLength : line.length;
			// 第两个
			if (i > 0) {
				const duration = parseInt(data[i].timestamp - data[i - 1].timestamp);
				tick = (duration > 200 ? 200 : duration) / averageLineLength;
			}
			// 清空画布
			ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeigth);

			// 静态的
			if (this.canvasCache) {
				ctx.putImageData(this.canvasCache, 0, 0);
			}

			await new Promise((resolve, reject) => {
				// 动态的
				this._animate(ctx, line, resolve, tick);
			});
		}
	};
	_animate = (ctx, data, resolve, tick) => {
		const {scale, canvasWidth, canvasHeigth} = this;
		// index
		let startIndex = 1;
		// 克隆数据
		let points = [];
		for (let i = 0; i < data.length; i += 1) {
			points.push(data[i]);
		}
		let oldTime = Date.now();
		this.rafid = window.requestAnimationFrame(renderLoop.bind(this));
		function renderLoop() {
			const newTime = Date.now();
			if (newTime - oldTime > tick) {
				oldTime = newTime;
				if (startIndex >= points.length / 3) {
					// 这个地方有可能会丢点，懒一会再改
					window.cancelAnimationFrame(this.rafid);
					this.canvasCache = ctx.getImageData(0, 0, canvasWidth, canvasHeigth);
					resolve('next');
				} else {
					//贝塞尔曲线
					const animatePoints = points.slice((startIndex - 1) * 3, startIndex * 3);
					if (animatePoints.length == 3) {
						ctx.beginPath();
						const startPoint = points[(startIndex - 1) * 3 == 0 ? 0 : (startIndex - 1) * 3 - 1].split(' ');
						ctx.moveTo(startPoint[0] * scale, startPoint[1] * scale);
						ctx.lineTo(animatePoints[0] * scale, animatePoints[1] * scale);
						const control1 = animatePoints[0].split(' ');
						const control2 = animatePoints[1].split(' ');
						const stop = animatePoints[2].split(' ');
						ctx.bezierCurveTo(
							control1[0] * scale,
							control1[1] * scale,
							control2[0] * scale,
							control2[1] * scale,
							stop[0] * scale,
							stop[1] * scale
						);
					} else {
						console.log('长度不够');
					}
					ctx.closePath();
					ctx.stroke();
					startIndex++;
					this.rafid = window.requestAnimationFrame(renderLoop.bind(this));
				}
			} else {
				this.rafid = window.requestAnimationFrame(renderLoop.bind(this));
			}
		}
	};
	_destory = () => {
		// 销毁当前动画
		window.cancelAnimationFrame(this.rafid);
	};
	componentWillUnmount() {
		this._destory();
	}
	componentDidMount() {
		const {data} = this.props;
		if (data.length > 0) {
			this._init(data);
		}
	}
	componentWillReceiveProps(nextProps) {
		const {data} = nextProps;
		this._init(data);
	}
	render() {
		return (
			<div
				ref={el => {
					this.myCanvasContainer = el;
				}}
			/>
		);
	}
}
export default HandWriting;
