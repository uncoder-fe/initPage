import React, { Component } from 'react';
import ControlPanel from './control-panel/index.jsx';
import './index.less';

class HandWriting extends Component {
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
    _dataAdapter = time => {
        const { timeArry } = this.state;
        let index = 0;
        for (let i = 0; i < timeArry.length; i++) {
            if (time * 1000 < timeArry[i]) {
                index = i - 1;
                break;
            }
        }
        return index < 0 ? 0 : index;
    };
    // 笔划停顿时间
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
        const { speed, currentTime, timeline, playStatus } = this.state;
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
        const dataIndex = this._dataAdapter(currentTime);
        const _staticData = data.slice(0, dataIndex);
        // const _animateData = data.slice(dataIndex, data.length);
        // 静态
        this._staticRender(ctx, _staticData);
        // 动态
        this._loop(ctx, dataIndex, data);
    };
    // 渲染数据
    _loop = async (ctx, i, _animateData) => {
        const { speed, currentTime, timeline, playStatus, timeArry } = this.state;
        // 判断播放状态
        if (playStatus != 0) {
            ctx.putImageData(this.canvasCache, 0, 0);
            return;
        }
        // 笔划间隔，书写思考时间
        if (_animateData[i + 1]) {
            let delayTime = _animateData[i + 1]['t1'] - _animateData[i]['t2'] || 0;
            if (currentTime * 1000 - timeArry[i] > 1000) {
                delayTime = delayTime - (currentTime * 1000 - timeArry[i]);
            }
            await this._thinkDelayTime(delayTime / speed);
        }
        const line = _animateData[i].points.split(',');
        // 笔划中点阵间隔
        let tick = 16;
        // 剔除笔划中点阵间隔异常点
        if (_animateData[i].t2 && _animateData[i].t1) {
            const duration = parseInt(_animateData[i].t2 - _animateData[i].t1);
            tick = parseInt(duration / line.length);
            if (tick > 30) {
                tick = 16;
            }
        }
        // 清空画布
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeigth);
        // 如果有canvas缓存，使用缓存
        if (this.canvasCache && playStatus === 0) {
            ctx.putImageData(this.canvasCache, 0, 0);
        }
        // 动态渲染笔划
        await new Promise((resolve, reject) => {
            this._animateRender(ctx, line, tick, speed, resolve);
        });
        // 下一划
        if (_animateData[i + 1]) {
            await this._loop(ctx, i + 1, _animateData);
        }
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
        this.canvasCache = ctx.getImageData(0, 0, canvasWidth, canvasHeigth);
    };
    // 动态渲染
    _animateRender = (ctx, data, tick, speed, resolve) => {
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
        // 销毁缓存
        this.canvasCache = null;
        // 销毁canvas
        this.myCanvasContainer.innerHTML = '';
    };
    // 播放
    _play = currentTime => {
        this._destory();
        this.setState({ currentTime, playStatus: 0 }, () => {
            this._init();
        });
    };
    // 暂停
    _pause = currentTime => {
        this.setState({ currentTime, playStatus: 1 }, () => {
            window.cancelAnimationFrame(this.rafid);
        });
    };
    // 控制面板参数
    _changePanelSetting = setingData => {
        const { timeline } = this.state;
        const { speed, currentTime } = setingData;
        window.cancelAnimationFrame(this.rafid);
        this.setState({ speed, currentTime, playStatus: 1 }, () => {
            const { myCanvasContainer, originData, canvasWidth, canvasHeigth } = this;
            const data = originData;
            const ctx = myCanvasContainer.children[0].getContext('2d');
            ctx.clearRect(0, 0, canvasWidth, canvasHeigth);
            // 数据切割
            const dataIndex = this._dataAdapter(currentTime);
            const _staticData = data.slice(0, dataIndex);
            // 静态
            this._staticRender(ctx, _staticData);
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
        // 生成唯一Key
        const comKey = Math.random()
            .toString(36)
            .slice(2);
        if (data.length > 0) {
            const timeline = parseInt((data[data.length - 1]['t2'] - data[0]['t1']) / 1000);
            const timeArry = data.map((item, index) => {
                const { t1, t2 } = item;
                if (index == 0) {
                    return t2 - t1;
                }
                return t1 - data[0].t1;
            });
            this.setState({ timeline, speed: 1, range: 0, comKey, timeArry }, () => {
                this._init();
            });
        }
    }
    // 当组件通过key销毁时，重新创建
    componentDidMount() {
        const { data } = this.props;
        // 缓存原始数据
        this.originData = data;
        // 生成唯一Key
        const comKey = Math.random()
            .toString(36)
            .slice(2);
        if (data.length > 0) {
            const timeline = parseInt((data[data.length - 1]['t2'] - data[0]['t1']) / 1000);
            const timeArry = data.map((item, index) => {
                const { t1, t2 } = item;
                if (index == 0) {
                    return t2 - t1;
                }
                return t1 - data[index - 1].t2;
            });
            this.setState({ timeline, speed: 1, range: 0, timeArry, comKey }, () => {
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
