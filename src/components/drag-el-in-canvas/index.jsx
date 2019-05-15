import React, { Component } from 'react';
import querystring from 'querystring';
import _ from 'lodash';
import wrongIcon from './asset/wrong.png';
import rightIcon from './asset/right.png';
import halfIcon from './asset/half.png';
import './index.less';

// 定义icon
const ICON = {
	height: 98,
	width: 152
};
// 定义字体大小
const fontSize = 18;
// 定义拖放框大小
const rectSize = 5;
// 鼠标形状
const CURSOR = {
	rightCenter: 'e-resize',
	leftCenter: 'w-resize',
	bottomCenter: 's-resize',
	topCenter: 'n-resize',
	default: 'defalut',
	move: 'move'
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
		const { type } = content;
		let x = 0;
		let y = 0;
		if (type == 'right' || type == 'wrong' || type == 'half') {
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
		const { type, textArry, image } = content;
		ctx.fillStyle = 'rgba(255,125,113,0.1)';
		ctx.strokeStyle = '#FF6337';
		if (type == 'right' || type == 'wrong' || type == 'half') {
			ctx.drawImage(image, x, y, ICON.width, ICON.height);
			if (active) {
				ctx.fillRect(x, y, ICON.width, ICON.height);
				ctx.strokeRect(x, y, ICON.width, ICON.height);
			}
		} else if (type == 'text') {
			if (active) {
				ctx.fillRect(x, y, width, height);
				ctx.strokeRect(x, y, width, height);
			}
			for (let i = 0; i < textArry.length; i++) {
				if (textArry[i]) {
					ctx.fillStyle = '#ff6337';
					ctx.fillText(textArry[i], x, y + i * fontSize + fontSize);
				}
			}
		} else if (type == 'rect') {
			ctx.strokeRect(x, y, width, height);
			if (active) {
				ctx.fillStyle = '#FF6337';
				// 上中
				ctx.fillRect(x + width / 2 - rectSize, y, rectSize * 2, rectSize * 2);
				// 右中
				ctx.fillRect(x + width - 2 * rectSize, y + height / 2 - rectSize, rectSize * 2, rectSize * 2);
				// 左中
				ctx.fillRect(x, y + height / 2 - rectSize, rectSize * 2, rectSize * 2);
				// 下中
				ctx.fillRect(x + width / 2 - rectSize, y + height - rectSize * 2, rectSize * 2, rectSize * 2);
			}
		}
	}
}
// 定义拖拽元素容器
class Stage extends Component {
	constructor(props) {
		super();
		this.state = {
			isImageLoad: false, // 是否图片已全部加载
			isImageLoadFail: false, // 是否有图片加载失败
			showInputModal: false, // 是否显示输入框
			actionName: props.actionName,
			imgUrl: props.imgUrl
		};
		const scale = props.scale || 1;
		const { height, width } = { ...querystring.parse(props.imgUrl.split('?')[1]) };
		this.imageInfo = {
			width: parseInt(width) * scale,
			height: parseInt(height) * scale
		};
		// 绘制内容
		this.drawList = [];
		// 是否可移动
		this.canMove = false;
		// 当前使用的元素
		this.currentSprite = null;
		// 点击初始化位置
		this.downPosition = { x: 0, y: 0 };
		// 是否在画框
		this.rectDrawing = false;
		// 放大框的方向
		this.rectGrowing = null;
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
	hitSprite(event) {
		const { drawList } = this;
		const hitArry = drawList.filter(item => {
			const { x, y, content, width, height } = item;
			const { type } = content;
			if (
				(type == 'text' || type == 'rect') &&
				event.x > x &&
				event.x < x + width &&
				event.y > y &&
				event.y < y + height
			) {
				return true;
			} else if (
				(type == 'right' || type == 'wrong' || type == 'half') &&
				event.x > x &&
				event.x < x + width &&
				event.y > y &&
				event.y < y + height
			) {
				// console.log('icon');
				return true;
			}
			// console.log('nothing');
			return false;
		});
		return hitArry;
	}
	// 检测命中放大区域
	hitSpriteGrow(sprite, eventX, eventY) {
		const { x, y, height, width } = sprite;
		if (
			x + width / 2 - rectSize < eventX &&
			eventX < x + width / 2 + rectSize &&
			y < eventY &&
			eventY < y + rectSize * 2
		) {
			return 'topCenter';
		}
		if (
			x + width - 2 * rectSize < eventX &&
			eventX < x + width &&
			y + height / 2 - rectSize < eventY &&
			eventY < y + height / 2 + rectSize
		) {
			return 'rightCenter';
		}
		if (
			x < eventX &&
			eventX < x + rectSize * 2 &&
			y + height / 2 - rectSize < eventY &&
			eventY < y + height / 2 + rectSize
		) {
			return 'leftCenter';
		}
		if (
			x + width / 2 - rectSize < eventX &&
			eventX < x + width / 2 + rectSize &&
			y + height - rectSize * 2 < eventY &&
			eventY < y + height
		) {
			return 'bottomCenter';
		}
		return null;
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
		ctx.font = `${fontSize}px serif`;
		const text = this.ctx.measureText(str);
		return text.width;
	}
	// 检测文字是否需要换行
	textOutArea(x, str) {
		const { imageInfo } = this;
		const textArry = [];
		// 直接返回
		if (x + this.getTextWidth(str) < imageInfo.width) {
			textArry.push(str);
			return textArry;
		}
		// 超出
		let text = '';
		let start = 0;
		const stringArry = str.split('');
		for (let i = 0; i < stringArry.length; i++) {
			text += stringArry[i];
			if (x + this.getTextWidth(text) > imageInfo.width - fontSize) {
				textArry.push(stringArry.slice(start, i + 1).join(''));
				text = '';
				start = i + 1;
			}
		}
		// 最后剩余的一行
		if (stringArry.slice(start, stringArry.length) != '') {
			textArry.push(stringArry.slice(start, stringArry.length).join(''));
		}
		return textArry;
	}
	// 设置缓存
	setCache() {
		const { ctx, currentSprite, drawList, imageInfo } = this;
		const filterArry = currentSprite ? drawList.filter(item => item.key != currentSprite.key) : drawList;
		this.redraw(filterArry);
		const imageData = ctx.getImageData(0, 0, imageInfo.width, imageInfo.height);
		this.cache = imageData;
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
		const { x, y } = this.downPosition;
		if (code == 13) {
			if (value) {
				const textArry = this.textOutArea(x, value);
				let width = this.getTextWidth(value);
				let height = fontSize;
				if (textArry.length > 1) {
					width = this.getTextWidth(textArry[0]);
					height = textArry.length * fontSize;
				}
				const el = new Sprite(x, y, { type: 'text', text: value, textArry }, width, height);
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
		const hitArry = this.hitSprite({ x, y });
		this.downPosition = { ...this.downPosition, x, y };
		if (hitArry.length > 0) {
			// 命中
			const currentSprite = hitArry[hitArry.length - 1];
			// 命中框的靶心
			if (currentSprite.content.type == 'rect') {
				this.rectGrowing = this.hitSpriteGrow(currentSprite, x, y);
			} else {
				this.rectGrowing = null;
			}
			this.currentSprite = {
				key: currentSprite.key,
				x: currentSprite.x,
				y: currentSprite.y,
				width: currentSprite.width || 1,
				height: currentSprite.height || 1,
				content: { ...currentSprite.content }
			};
			this.canMove = true;
			this.rectDrawing = false;
			this.setCache();
			this.redraw();
		} else {
			// 创建
			const { actionName } = this.state;
			let el = null;
			if (actionName == 'right' || actionName == 'wrong' || actionName == 'half') {
				let image = this.rightIcon;
				if (actionName == 'wrong') {
					image = this.wrongIcon;
				} else if (actionName == 'half') {
					image = this.halfIcon;
				}
				// 校验点击位置，是否icon超出了边界
				const xx =
					x < ICON.width
						? ICON.width / 2
						: x > this.imageInfo.width - ICON.width / 2
						? this.imageInfo.width - ICON.width / 2
						: x;
				const yy =
					y < ICON.height
						? ICON.height / 2
						: y > this.imageInfo.height - ICON.height / 2
						? this.imageInfo.height - ICON.height / 2
						: y;
				el = new Sprite(xx, yy, { type: actionName, image }, ICON.width, ICON.height);
				el.draw(this.ctx);
				this.drawList.push(el);
			}
			if (actionName == 'text') {
				this.setState({ showInputModal: true }, () => {
					// 如果输入框放不下，左移动
					this.myInput.style.left = `${this.imageInfo.width - left < 120 ? left - 120 : left}px`;
					this.myInput.style.top = `${top}px`;
					this.myInput.removeEventListener('keydown', this.handleInput);
					this.myInput.addEventListener('keydown', event => this.handleInput(event));
					const focusTimer = setTimeout(() => {
						this.myInput.children[0].focus();
						window.clearTimeout(focusTimer);
					});
				});
			} else if (actionName == 'rect') {
				el = new Sprite(x, y, { type: 'rect' });
				this.drawList.push(el);
				this.rectDrawing = true;
				this.canMove = true;
				this.currentSprite = {
					key: el.key,
					x,
					y,
					width: 1,
					height: 1,
					content: { ...el.content }
				};
				el.draw(this.ctx);
				// 如果是画框，需要特殊处理
				this.setCache();
			}
		}
	}
	// 鼠标move事件监听
	handleMousemove = event => {
		const { x, y } = this.getCanvasPoint(event);
		// 更新当前元素位置
		const distanceX = x - this.downPosition.x;
		const distanceY = y - this.downPosition.y;
		const { currentSprite, drawList } = this;
		let sprite = null;
		// 鼠标形状
		const hitArry = this.hitSprite({ x, y });
		if (hitArry.length <= 0) {
			this.upperCanvas.style.cursor = CURSOR['default'];
		} else {
			sprite = hitArry[hitArry.length - 1];
			// 如果是框
			if (sprite.content.type == 'rect') {
				const growDirection = this.hitSpriteGrow(sprite, x, y);
				if (growDirection) {
					this.upperCanvas.style.cursor = CURSOR[growDirection];
				} else {
					this.upperCanvas.style.cursor = CURSOR['move'];
				}
			} else {
				this.upperCanvas.style.cursor = CURSOR['move'];
			}
		}
		// 画框
		if (this.rectDrawing) {
			const { type } = currentSprite.content;
			const index = drawList.findIndex(item => currentSprite.key == item.key);
			// 如果是框，在绘制状态，只更新宽高
			if (type == 'rect') {
				drawList[index].width = distanceX;
				drawList[index].height = distanceY;
				// 重绘
				this.redrawFromCache();
			}
			return;
		}
		// 变形吧，我的框
		if (this.rectGrowing) {
			sprite = drawList[drawList.findIndex(item => currentSprite.key == item.key)];
			//设定鼠标当前形状
			this.upperCanvas.style.cursor = CURSOR[this.rectGrowing];
			// 增长状态
			switch (this.rectGrowing) {
				case 'topCenter':
					if (distanceY > 0) {
						sprite.y = this.currentSprite.y + Math.abs(distanceY);
						sprite.height = this.currentSprite.height - Math.abs(distanceY);
					} else {
						sprite.y = this.currentSprite.y - Math.abs(distanceY);
						sprite.height = this.currentSprite.height + Math.abs(distanceY);
					}
					break;
				case 'bottomCenter':
					sprite.height = this.currentSprite.height + distanceY;
					break;
				case 'leftCenter':
					if (distanceX > 0) {
						sprite.x = this.currentSprite.x + Math.abs(distanceX);
						sprite.width = this.currentSprite.width - Math.abs(distanceX);
					} else {
						sprite.x = this.currentSprite.x - Math.abs(distanceX);
						sprite.width = this.currentSprite.width + Math.abs(distanceX);
					}
					break;
				case 'rightCenter':
					console.log(this.currentSprite, 'this.currentSprite');
					sprite.width = this.currentSprite.width + distanceX;
					break;
			}
			// 重绘
			this.redrawFromCache();
			return;
		}
		// 移动
		if (!currentSprite) {
			return;
		}
		const { type } = currentSprite.content;
		// 移动
		if (this.canMove) {
			this.upperCanvas.style.cursor = CURSOR['move'];
			// 更新坐标
			sprite.x = currentSprite.x + distanceX;
			sprite.y = currentSprite.y + distanceY;
			// 边界计算
			const isOuter = this.outArea(sprite);
			sprite.x = isOuter.x;
			sprite.y = isOuter.y;
			// 字体
			if (type == 'text') {
				const strArry = this.textOutArea(sprite.x, sprite.content.text);
				let width = this.getTextWidth(sprite.content.text);
				let height = fontSize;
				if (strArry.length > 1) {
					width = this.getTextWidth(strArry[0]);
					height = strArry.length * fontSize;
				}
				sprite.width = width;
				sprite.height = height;
				sprite.content.textArry = strArry;
			}
			// 重绘
			this.redrawFromCache();
		}
	};
	// 鼠标up事件监听
	handleMouseup() {
		if (this.currentSprite && this.currentSprite.content.type == 'rect' && this.rectDrawing) {
			this.currentSprite = null;
		}
		this.canMove = false;
		this.cache = null;
		this.rectDrawing = false;
		this.rectGrowing = null;
		this.upperCanvas.style.cursor = CURSOR['default'];
		this.redraw();
		// 踢出数据
		this.props.getContext(this.drawList);
	}
	// 鼠标out事件监听
	handleMouseout() {
		if (this.currentSprite && this.currentSprite.content.type == 'rect' && this.rectDrawing) {
			this.currentSprite = null;
		}
		this.canMove = false;
		this.cache = null;
		this.rectDrawing = false;
		this.rectGrowing = null;
		this.upperCanvas.style.cursor = CURSOR['default'];
		this.redraw();
		// 踢出数据
		this.props.getContext(this.drawList);
	}
	// 键盘
	handleKeyboard = event => {
		const code = event.keyCode || event.which || event.charCode;
		if (code == 8 || code == 46) {
			this.drawList = this.drawList.filter(item => item.active != true);
			this.redraw();
		}
	};
	// 预加载图片
	preLoadImage = imgUrl => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.src = imgUrl;
			img.onload = resolve;
			img.onerror = reject;
		});
	};
	tryLoadAgain = () => {
		this.componentDidMount();
	};
	initStage() {
		const { width, height } = this.imageInfo;
		this.ctx = this.introCanvas.getContext('2d');
		this.introCanvas.height = height;
		this.introCanvas.width = width;
		this.introCanvas.style = `position:absolute;top:0;left:0;touch-action: none;user-select: none;cursor: default;`;
		this.upperCanvas.height = height;
		this.upperCanvas.width = width;
		this.upperCanvas.style = `position:absolute;top:0;left:0;touch-action: none;user-select: none;cursor: default;`;
		// this.ctx.scale(2, 2);
		this.upperCanvas.addEventListener('mousedown', event => this.handleMousedown(event));
		// this.upperCanvas.addEventListener('mousemove', _.throttle(this.handleMousemove, 50));
		this.upperCanvas.addEventListener('mousemove', event => this.handleMousemove(event));
		this.upperCanvas.addEventListener('mouseup', event => this.handleMouseup(event));
		this.upperCanvas.addEventListener('mouseout', event => this.handleMouseout(event));
		document.addEventListener('keydown', event => this.handleKeyboard(event));
	}
	componentDidMount() {
		const { imgUrl } = this.props;
		this.preLoadImage(imgUrl)
			.then(() => {
				this.setState({ isImageLoad: true }, () => {
					this.initStage();
				});
			})
			.catch(() => {
				this.setState({
					isImageLoad: true,
					isImageLoadFail: true
				});
			});
	}
	componentWillReceiveProps(nextProps) {
		if (this.state.actionName != nextProps.actionName) {
			this.setState({
				actionName: nextProps.actionName
			});
			if (nextProps.actionName == 'clear') {
				this.drawList = [];
				this.redraw();
			}
		}
	}
	render() {
		const { isImageLoad, isImageLoadFail, showInputModal, imgUrl } = this.state;
		const { height, width } = this.imageInfo;
		if (!isImageLoad) {
			return (
				<div className="component-draw-tools">
					<div className="component-draw-tools-info" style={{ height, width }}>
						{isImageLoadFail ? (
							<div onClick={this.tryLoadAgain}>
								<span>旋转</span>加载失败，请点击重试...
							</div>
						) : (
							<div>加载中...</div>
						)}
					</div>
				</div>
			);
		}
		return (
			<div className="component-draw-tools" style={{ position: 'relative' }}>
				<div style={{ position: 'relative', height, width }}>
					<canvas id="intro-canvas" ref={canvas => (this.introCanvas = canvas)} />
					<canvas id="upper-canvas" ref={canvas => (this.upperCanvas = canvas)} />
					<img src={imgUrl} alt="" style={{ height, width }} />
				</div>
				<div className="pre-load" style={{ display: 'none' }}>
					<img src={rightIcon} alt="" ref={img => (this.rightIcon = img)} />
					<img src={wrongIcon} alt="" ref={img => (this.wrongIcon = img)} />
					<img src={halfIcon} alt="" ref={img => (this.halfIcon = img)} />
				</div>
				<div
					style={{ display: showInputModal ? 'block' : 'none', position: 'absolute' }}
					ref={input => (this.myInput = input)}
				>
					<input type="text" placeholder="最多输入20个字..." maxLength="20" />
				</div>
			</div>
		);
	}
}

export default Stage;
