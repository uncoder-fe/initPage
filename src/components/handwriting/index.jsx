import React, { Component } from 'react';
import ControlPanel from './control-panel/index.jsx';
import './index.less';

class HandWriting extends Component {
    constructor() {
        super();
        this.ratio = window.devicePixelRatio;
        this.scale = 0.5 * this.ratio;
        this.canvasHeigth = null;
        this.canvasWidth = null;
        this.rafid = null;
        this.originData = [];
        // 定时器
        this.timer = null;
        // 是否在进行动画
        this.animate = true;
        // canvas缓存
        this.canvasCache = null;
        this.state = {
            // 状态，播放 0，暂停 1，完成 2
            playStatus: 0,
            // 速度
            speed: 1,
            // 单位秒
            currentTime: 0,
            //单位秒
            timeline: 0,
            //单位毫秒
            timeArry: []
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
    // 时间映射到数据
    _dataAdapter = currentTime => {
        const { timeArry } = this.state;
        // 只有一画
        if (timeArry.length === 1) {
            return [0];
        }
        let index = [];
        for (let i = 0; i < timeArry.length; i++) {
            if (currentTime == timeArry[i]) {
                index.push(i - 1);
            }
        }
        // 最后一个笔画
        if (currentTime >= timeArry[timeArry.length - 1]) {
            index = [timeArry.length - 1];
        }
        return index;
    };
    // 当前时间靠近最近的上一个点
    _dataAdapterClose = currentTime => {
        const { timeArry } = this.state;
        let index = 0;
        for (let i = 0; i < timeArry.length; i++) {
            if (currentTime < timeArry[i]) {
                index = i - 1;
                break;
            } else if (currentTime >= timeArry[i] && i >= timeArry.length - 1) {
                // 最后一个笔画
                index = timeArry.length - 1;
            }
        }
        return index;
    };
    // 笔画停顿时间
    _thinkDelayTime = delayInms => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve('finish');
            }, delayInms);
        });
    };
    // 初始化
    _init = async () => {
        const { scale, originData } = this;
        const { currentTime, speed } = this.state;
        if (Object.prototype.toString.call(originData) !== '[object Array]' || originData.length <= 0) {
            console.log('无笔迹');
            return;
        }
        const size = this._getImageSize(originData);
        this.canvasHeigth = size.height * scale;
        this.canvasWidth = size.width * scale;
        // canvas
        const myCanvas = document.createElement('canvas');
        myCanvas.setAttribute('height', this.canvasHeigth);
        myCanvas.setAttribute('width', this.canvasWidth);
        // 确保高清无码，其实这里不缩放也是可以的，本身我就是按照后台给的坐标（逻辑像素来进行绘制的），所以我下面那个其实是多此一举的。
        // 如果数据源是图像（栅格化的），塞到canvas里肯定会模糊。
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
        const dataIndex = this._dataAdapterClose(currentTime);
        const _staticData = originData.slice(0, dataIndex);
        // 静态
        this._staticRender(ctx, _staticData);
        this.timer = window.setInterval(() => {
            let { currentTime } = this.state;
            const { timeline } = this.state;
            // 播放结束
            if (currentTime > timeline) {
                window.clearInterval(this.timer);
                this.setState({ currentTime: timeline, playStatus: 2 });
            }
            // 下一秒
            if (currentTime < timeline) {
                currentTime += 1;
                this.setState({ currentTime }, () => {
                    // 动态
                    this._loop(ctx);
                });
            }
        }, 1000 / speed);
    };
    // 渲染数据
    _loop = async ctx => {
        const { originData } = this;
        const { speed, currentTime, playStatus } = this.state;
        const waitAnimateArry = this._dataAdapter(currentTime);
        // 如果当前时间点，没有waitAnimateArry
        if (waitAnimateArry.length <= 0) {
            return;
        }
        // 如果动画正在进行中，则直接忽略当前时间点
        if (!this.animate) {
            return;
        }
        // 动画进行中
        this.animate = false;
        // 还原上一秒的画面
        if (playStatus === 0) {
            // 清空画布
            ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeigth);
            this._staticRender(ctx, originData.slice(0, waitAnimateArry[0]));
            // (逻辑上应该使用缓存来做，不过这个数据适配时是大概的进度，缓存的内容和数据不能对应上)
            // ctx.putImageData(this.canvasCache, 0, 0);
        }
        // console.log('currentTime=>', currentTime, 'waitArry=>', waitAnimateArry);
        for (let i = 0; i < waitAnimateArry.length; i++) {
            const { t1, t2, points } = originData[waitAnimateArry[i]];
            const line = points.split(',');
            // 笔画中点阵间隔
            let tick = 16;
            // 剔除笔画中点阵间隔异常点
            if (t2 && t1) {
                const duration = Math.ceil(t2 - t1);
                tick = Math.ceil(duration / line.length);
                if (tick > 30) {
                    tick = 16;
                }
            }
            // 动态渲染笔画
            await new Promise((resolve, reject) => {
                this._animateRender(ctx, line, tick, speed, resolve);
            });
        }
        // 动画结束，重置
        this.animate = true;
        // 存储这一秒的缓存
        this.canvasCache = ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeigth);
    };
    // 静态渲染
    _staticRender = (ctx, json) => {
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
                    ctx.stroke();
                }
            }
        });
        this.canvasCache = ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeigth);
    };
    // 动态渲染
    _animateRender = (ctx, data, tick, speed, resolve) => {
        const { scale } = this;
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
                            } else {
                                // console.log("fuck 丢了1个点，不管了")
                            }
                            ctx.stroke();
                        }
                    } else {
                        let control1;
                        let control2;
                        let stop;
                        if (data.length >= 3 && points.length == 2) {
                            control1 = data[(startIndex - 1) * 3 * speed - 1].split(' ');
                            control2 = points[0].split(' ');
                            stop = points[1].split(' ');
                            ctx.beginPath();
                            ctx.bezierCurveTo(
                                control1[0] * scale,
                                control1[1] * scale,
                                control2[0] * scale,
                                control2[1] * scale,
                                stop[0] * scale,
                                stop[1] * scale
                            );
                            ctx.stroke();
                        } else {
                            for (let i = 0; i < points.length; i++) {
                                const startPoint = points[i].split(' ');
                                const endPoint = points[i + 1];
                                if (endPoint) {
                                    ctx.beginPath();
                                    ctx.moveTo(startPoint[0], startPoint[1]);
                                    ctx.lineTo(endPoint.split(' ')[0], endPoint.split(' ')[1]);
                                    ctx.stroke();
                                } else {
                                    ctx.beginPath();
                                    ctx.moveTo(startPoint[0], startPoint[1]);
                                    ctx.lineTo(startPoint[0], startPoint[1]);
                                    ctx.stroke();
                                }
                            }
                        }
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
        // 销毁定时器
        window.clearInterval(this.timer);
        // 销毁缓存
        this.canvasCache = null;
        // 销毁canvas
        this.myCanvasContainer.innerHTML = '';
        // 动画
        this.animate = true;
    };
    // 播放
    _play = () => {
        const { currentTime } = this.state;
        this._destory();
        this.setState({ currentTime, playStatus: 0 }, () => {
            this._init();
        });
    };
    // 暂停
    _pause = () => {
        window.cancelAnimationFrame(this.rafid);
        window.clearInterval(this.timer);
        this.setState({ playStatus: 1 });
    };
    // 控制面板参数
    _changePanelSetting = setingData => {
        let { speed, currentTime } = setingData;
        speed = speed ? speed : this.state.speed;
        currentTime = currentTime ? currentTime : this.state.currentTime;
        currentTime = currentTime >= this.state.timeline ? 0 : currentTime;
        const playStatus = currentTime >= 0 ? 1 : 2;
        window.cancelAnimationFrame(this.rafid);
        window.clearInterval(this.timer);
        this.setState({ speed, currentTime, playStatus }, () => {
            const { myCanvasContainer, originData, canvasWidth, canvasHeigth } = this;
            const ctx = myCanvasContainer.children[0].getContext('2d');
            ctx.clearRect(0, 0, canvasWidth, canvasHeigth);
            // 数据切割
            const dataIndex = this._dataAdapterClose(currentTime);
            const _staticData = originData.slice(0, dataIndex);
            // 静态
            this._staticRender(ctx, _staticData);
        });
    };
    // 组件卸载
    componentWillUnmount() {
        this._destory();
    }
    // 当组件不使用key，或者key不变时
    componentWillReceiveProps(nextProps) {
        this._destory();
        const { data } = nextProps;
        // 缓存原始数据
        this.originData = data;
        // 生成唯一Key，定义组件唯一
        const comKey = Math.random()
            .toString(36)
            .slice(2);
        if (data.length > 0) {
            // 最后一笔画距离起点的位置
            const timeline = Math.ceil((data[data.length - 1]['t2'] - data[0]['t1']) / 1000);
            // 计算每一笔画开始时间，距离起点的长度
            const timeArry = data.map((item, index) => {
                const { t1 } = item;
                // 第一笔画
                if (index == 0) {
                    return 0;
                }
                return Math.ceil((t1 - data[0].t1) / 1000);
            });
            this.setState({ timeline, speed: 1, range: 0, comKey, timeArry }, () => {
                this._init();
            });
        }
    }
    // 当组件通过key销毁时，重新创建
    componentDidMount() {
        this._destory();
        const { data } = this.props;
        // 缓存原始数据
        this.originData = data;
        // 生成唯一Key，定义组件唯一
        const comKey = Math.random()
            .toString(36)
            .slice(2);
        if (data.length > 0) {
            // 最后一笔画距离起点的位置
            const timeline = Math.ceil((data[data.length - 1]['t2'] - data[0]['t1']) / 1000);
            // 计算每一笔画开始时间，距离起点的长度
            const timeArry = data.map((item, index) => {
                const { t1 } = item;
                // 第一笔画
                if (index == 0) {
                    return 0;
                }
                return Math.ceil((t1 - data[0].t1) / 1000);
            });
            this.setState({ timeline, speed: 1, range: 0, comKey, timeArry }, () => {
                this._init();
            });
        }
    }
    render() {
        const { maxHeight } = this.props;
        const { playStatus, speed, currentTime, timeline, comKey } = this.state;
        return (
            <div className="handwriting">
                <div
                    className="handwriting-canvas-container"
                    style={{ maxHeight }}
                    ref={el => {
                        this.myCanvasContainer = el;
                    }}
                />
                <ControlPanel
                    comKey={comKey}
                    playStatus={playStatus}
                    speed={speed}
                    currentTime={currentTime}
                    timeline={timeline}
                    onChangePlay={this._changePanelSetting}
                    onPlayFn={this._play}
                    onPauseFn={this._pause}
                />
            </div>
        );
    }
}
export default HandWriting;
