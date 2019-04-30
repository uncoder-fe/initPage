import React, { Component } from 'react';
import _ from 'lodash';
import wrongIcon from './asset/wrong.png';
import rightIcon from './asset/right.png';
import './index.less';

// 定义icon
const ICON = {
	height: 50,
	width: 50
};

// 定义基础元素
class Sprite {
	constructor(eventX, eventY, content, width, height) {
		// 唯一key
		this.key = Math.random()
			.toString(36)
			.slice(2);
		// 内容
		this.content = content;
		// 校准位置
		const { type, value } = content;
		let x = 0;
		let y = 0;
		if (type.indexOf('Icon') > 0) {
			x = eventX - ICON.width / 2;
			y = eventY - ICON.height / 2;
		} else if (type == 'text' || type == 'rect') {
			x = eventX;
			y = eventY;
		}
		// 位置 x
		this.x = x;
		// 位置 y
		this.y = y;
		// 高度
		this.height = height || 0;
		// 宽度
		this.width = width || 0;
		// 激活状态
		this.active = false;
	}
	draw(ctx) {
		const { x, y, content, width, height, active } = this;
		const { type, words, image } = content;
		ctx.fillStyle = 'red';
		ctx.strokeStyle = 'red';
		if (type.indexOf('Icon') > 0) {
			ctx.drawImage(image, x, y, ICON.width, ICON.height);
			if (active) {
				ctx.strokeRect(x, y, ICON.width, ICON.height);
			}
		} else if (type == 'text') {
			for (let i = 0; i < words.length; i++) {
				if (words[i]) {
					ctx.fillText(words[i], x, y + i * 30);
				}
			}
			if (active) {
				ctx.strokeRect(x, y - 30, width, height);
			}
		} else if (type == 'rect') {
			ctx.strokeRect(x, y, width, height);
			ctx.fillRect(x + width / 2 - 5, y + height - 5, 10, 10);
		}
	}
}
// 定义拖拽元素容器
class Stage extends Component {
	constructor() {
		super();
		this.state = {
			showInputModal: false,
			actionName: ''
		};
		this.imageInfo = {
			height: 300,
			width: 300,
			url: ''
		};
		this.drawList = [];
		this.canMove = false;
		this.currentSprite = null;
		this.downPosition = { x: 0, y: 0 };
	}
	// 获取位置
	getCanvasPoint(event) {
		const target = event.target;
		// 视窗偏移量
		const targteRect = target.getBoundingClientRect();
		const targteParentRect = target.parentNode.getBoundingClientRect();
		// 内部滚动的高度
		const scrollHeight = target.parentNode.scrollTop;
		// 点击位置
		const eventX = event.clientX;
		const eventY = event.clientY;
		// canvas缩放后的尺寸
		const offsetHeight = target.offsetHeight;
		const offsetWidth = target.offsetWidth;
		// 相对位置
		const canvasPointX = ((eventX - targteRect.left) / offsetWidth) * this.imageInfo.width;
		const canvasPointY = ((eventY - targteRect.top) / offsetHeight) * this.imageInfo.height;
		// console.log({x:canvasPointX,y:canvasPointY});
		// console.log(offsetX, offsetY)
		return {
			// 相对
			x: canvasPointX,
			y: canvasPointY,
			// 真实
			left: eventX - targteParentRect.left,
			top: eventY - targteParentRect.top + scrollHeight
		};
	}
	// 检测是否命中已存在的区域
	hitEl(event) {
		const { drawList } = this;
		const hitArry = drawList.filter(item => {
			const { x, y, content, width, height } = item;
			const { type } = content;
			if (type == 'text' && event.x > x && event.x < x + width && event.y > y - 30 && event.y < y + height - 30) {
				return true;
			} else if (
				type.indexOf('Icon') > 0 &&
				event.x > x &&
				event.x < x + width &&
				event.y > y &&
				event.y < y + height
			) {
				// console.log('icon');
				return true;
			} else if (type == 'rect' && event.x > x && event.x < x + width && event.y > y && event.y < y + height) {
				// console.log('rect');
				return true;
			}
			// console.log('nothing');
			return false;
		});
		return hitArry;
	}
	// 检测绘制区域是否超出
	outArea(el) {
		const { x, y, content, height, width } = el;
		const { imageInfo } = this;
		const reset = { x, y };
		if (x + width > imageInfo.width) {
			reset.x = imageInfo.width - width;
		}
		if (y + height > imageInfo.height && content.type != 'text') {
			reset.y = imageInfo.height - height;
		}
		// 锁住文字上面的区域
		if (content.type == 'text' && reset.y < 30) {
			reset.y = 30;
		}
		if (x <= 0) {
			reset.x = 0;
		}
		if (y <= 0) {
			reset.y = 0;
		}
		return reset;
	}
	getTextWidth(str) {
		const { ctx } = this;
		ctx.font = '30px serif';
		const text = this.ctx.measureText(str);
		return text.width;
	}
	// 检测文字是否需要换行
	textOutArea(x, str) {
		const { imageInfo } = this;
		const words = [];
		// 直接返回
		if (x + this.getTextWidth(str) < imageInfo.width) {
			words.push(str);
			return words;
		}
		// 超出
		let word = '';
		let start = 0;
		const stringArry = str.split('');
		for (let i = 0; i < stringArry.length; i++) {
			word += stringArry[i];
			if (x + this.getTextWidth(word) > imageInfo.width - 30) {
				words.push(stringArry.slice(start, i + 1).join(''));
				word = '';
				start = i + 1;
			}
		}
		// 最后剩余的一行
		words.push(stringArry.slice(start, stringArry.length).join(''));
		return words;
	}
	// 设置缓存
	setCache() {
		const { ctx, currentSprite, drawList, imageInfo } = this;
		const filterArry = drawList.filter(item => item.key != currentSprite.key);
		this.redraw(filterArry);
		const imageData = ctx.getImageData(0, 0, imageInfo.width, imageInfo.height);
		this.cache = imageData;
		// this.cacheCtx.putImageData(imageData, 0, 0);
	}
	// 缓存重绘
	redrawFromCache() {
		const { ctx, currentSprite, drawList, cache } = this;
		const el = drawList.find(item => currentSprite.key == item.key);
		ctx.putImageData(cache, 0, 0);
		el.draw(ctx);
	}
	// 重绘
	redraw(list) {
		const { ctx, drawList, currentSprite, imageInfo } = this;
		const currentList = list || drawList;
		ctx.clearRect(0, 0, imageInfo.width, imageInfo.height);
		for (let i = 0; i < currentList.length; i++) {
			if (currentSprite && currentSprite.key == currentList[i].key) {
				currentList[i].active = true;
			} else {
				currentList[i].active = false;
			}
			currentList[i].draw(ctx);
		}
	}
	// 键盘输入
	handleInput = event => {
		event.stopPropagation();
		const code = event.keyCode || event.which || event.charCode;
		const value = event.target.value;
		const { left, top } = event.target.parentNode.style;
		if (code == 13) {
			if (value) {
				const x = parseInt(left);
				const y = parseInt(top);
				const words = this.textOutArea(x, value);
				let width = this.getTextWidth(value);
				let height = 30;
				if (words.length > 1) {
					width = this.getTextWidth(words[0]);
					height = words.length * 30;
				}
				const el = new Sprite(x, y, { type: 'text', value, words }, width, height);
				this.drawList.push(el);
				el.draw(this.ctx);
				event.target.value = '';
			}
			// 回车
			this.setState({ showInputModal: false });
		} else if (code == 27) {
			// 回车
			this.setState({ showInputModal: false });
			event.target.value = '';
		}
	};
	// 鼠标down事件监听
	handleMousedown(event) {
		const { x, y, left, top } = this.getCanvasPoint(event);
		const hitArry = this.hitEl({ x, y });
		if (hitArry.length > 0) {
			// 命中不新建
			const currentSprite = hitArry[hitArry.length - 1];
			// 命中状态取反
			// this.drawList.forEach(element => {
			// 	if (currentSprite.key == element.key) {
			// 		element.active = !element.active;
			// 	}
			// });
			this.currentSprite = {
				key: currentSprite.key,
				x: currentSprite.x,
				y: currentSprite.y,
				content: { ...currentSprite.content }
			};
			this.canMove = true;
			this.downPosition = { ...this.downPosition, x, y };
			this.setCache();
			this.redraw();
		} else {
			// 创建
			const { actionName } = this.state;
			let el = null;
			switch (actionName) {
				case 'rightIcon':
					el = new Sprite(x, y, { type: actionName, image: this.rightIcon }, 50, 50);
					el.draw(this.ctx);
					this.drawList.push(el);
					break;
				case 'wrongIcon':
					el = new Sprite(x, y, { type: actionName, image: this.wrongIcon }, 50, 50);
					el.draw(this.ctx);
					this.drawList.push(el);
					break;
				case 'halfIcon':
					el = new Sprite(x, y, { type: actionName, image: this.halfIcon }, 50, 50);
					el.draw(this.ctx);
					this.drawList.push(el);
					break;
			}
			if (actionName == 'text') {
				this.setState({ showInputModal: true }, () => {
					this.myInput.style.left = `${left}px`;
					this.myInput.style.top = `${top}px`;
					this.myInput.removeEventListener('keydown', this.handleInput);
					this.myInput.addEventListener('keydown', event => this.handleInput(event));
					const focusTimer = setTimeout(() => {
						this.myInput.children[0].focus();
						window.clearTimeout(focusTimer);
					});
				});
			} else if (actionName == 'rect') {
				el = new Sprite(x, y, { type: 'rect' }, 50, 50);
				this.drawList.push(el);
				el.draw(this.ctx);
			}
		}
	}
	// 鼠标move事件监听
	handleMousemove = event => {
		const { x, y } = this.getCanvasPoint(event);
		if (this.canMove) {
			// 更新当前元素位置
			const distanceX = x - this.downPosition.x;
			const distanceY = y - this.downPosition.y;
			const { currentSprite, drawList } = this;
			const { type } = currentSprite.content;
			const index = drawList.findIndex(item => currentSprite.key == item.key);
			drawList[index].x = this.currentSprite.x + distanceX;
			drawList[index].y = this.currentSprite.y + distanceY;
			if (false) {
				// 如果是文字，重新计算宽高
				// const words = this.textOutArea(x, value);
				// let width = this.getTextWidth(value);
				// let height = 30;
				// if (words.length > 1) {
				// 	width = this.getTextWidth(words[0]);
				// 	height = words.length * 30;
				// }
				// drawList[index].content.words = words;
				// drawList[index].width = width;
				// drawList[index].height = height;
				// console.log(drawList[index]);
			} else if (type == 'text' || type.indexOf('Icon') > 0 || type == 'rect') {
				const isOuter = this.outArea(drawList[index]);
				drawList[index].x = isOuter.x;
				drawList[index].y = isOuter.y;
			}
			// 重绘
			this.redrawFromCache();
		}
		return;
		const hitArry = this.hitEl({ x, y });
		if (hitArry.length > 0) {
			this.upperCanvas.style.cursor = 'move';
		} else {
			this.upperCanvas.style.cursor = 'default';
		}
	};
	// 鼠标up事件监听
	handleMouseup() {
		// this.redraw();
		this.canMove = false;
		this.currentSprite = null;
		this.cache = null;
	}
	// 键盘
	handleKeyboard = event => {
		const code = event.keyCode || event.which || event.charCode;
		if (code == 8 || code == 46) {
			this.drawList = this.drawList.filter(item => item.active != true);
			this.redraw();
		}
	};
	componentDidMount() {
		const { width, height } = this.imageInfo;
		this.upperCtx = this.upperCanvas.getContext('2d');
		this.ctx = this.introCanvas.getContext('2d');
		this.introCanvas.height = height;
		this.introCanvas.width = width;
		this.introCanvas.style = `position:absolute;top:0;left:0;touch-action: none;user-select: none;cursor: default;`;
		this.upperCanvas.height = height;
		this.upperCanvas.width = width;
		this.upperCanvas.style = `position:absolute;top:0;left:0;touch-action: none;user-select: none;cursor: default;`;
		// this.ctx.scale(2, 2);
		this.upperCanvas.addEventListener('mousedown', event => this.handleMousedown(event));
		this.upperCanvas.addEventListener('mousemove', _.throttle(this.handleMousemove, 10));
		this.upperCanvas.addEventListener('mouseup', event => this.handleMouseup(event));
		document.addEventListener('keydown', event => this.handleKeyboard(event));
		// this.upperCanvas.addEventListener('mouseout', event => this.handleMouseup(event));
	}
	componentWillReceiveProps(nextProps) {
		if (this.state.actionName != nextProps.actionName) {
			this.setState({
				actionName: nextProps.actionName
			});
		}
	}
	render() {
		const { showInputModal } = this.state;
		return (
			<div className="component-draw-tools" style={{ position: 'relative' }}>
				<div style={{ position: 'relative', height: this.imageInfo.height, width: this.imageInfo.width }}>
					<canvas id="intro-canvas" ref={canvas => (this.introCanvas = canvas)} />
					<canvas id="upper-canvas" ref={canvas => (this.upperCanvas = canvas)} />
				</div>
				<div className="pre-load" style={{ display: 'none' }}>
					<img src={rightIcon} alt="" ref={img => (this.rightIcon = img)} />
					<img src={wrongIcon} alt="" ref={img => (this.wrongIcon = img)} />
				</div>
				<div
					style={{ display: showInputModal ? 'block' : 'none', position: 'absolute' }}
					ref={input => (this.myInput = input)}
				>
					<input type="text" placeholder="最多输入20个字" onEn />
				</div>
			</div>
		);
	}
}

export default Stage;
