import React, { Component } from 'react';
import DragInput from './drag-input';

import './index.less';

const playIcon =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAARVBMVEUAAABBe/9AgP9Bev9Cev9Bev9Aev9Aef9Cev9Bev9Be/9Ce/9AeP9Cev9Be/9Cev9Cev9Ce/9Be/9Ae/9AfP9Bef9Ce/9ju6GTAAAAFnRSTlMA0BDwgMAwUJDfcOAgf6CfYI+wX0A/JCxAUgAAAPxJREFUOMuFU1myxCAIFMEoGk3yZh73P+ps5ULGmvCRlNg0i40ZzG8ORMAd3kzMbihAtO9EILjZ8z1hims9rDFh1uGAZJWDEAbHwrCcKRfg5rNc0ZqVqxf6vUZAra/z6yxIb+DrNzfCF3VJQ8y/TpLC84uxOe4iup2IxnhZ2znI08YJreJNgX52IqJJIBhHGqBJgjMwAcjW+gAj+wQgNUuUS8A8hesppkX+2aHI8NUm+rFNNajSwvug1Kh9D++jNoV7yN1r4XG4fO4rwfyWHEPTxVy0yTauNJE9p0UtTtb1ZzyxEvK4evzdmi0ocOTbLR8gGKZl+/BZ/zBO8wHUqw0rxV0YPQAAAABJRU5ErkJggg==';
const pauseIcon =
	'data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAANlBMVEUAAABBev9AeP9AfP9AgP9Cev9Be/9Be / 9Bev9Bev9Be / 9Bev9Be / 9Cev9Aef9Aev9Cev9Ce / 9tblxbAAAAEXRSTlMA8CBAEIDQoM / AcGDgf1AwkFoE2fEAAADZSURBVDjLhZPZEsMgCEXBhsUtKf//s51m2mBWeHBGOYAKFwabJauZZpnhwpKgMVGtRGwo6eCeOraaNrg27NPOr1j2EQV1IBbkdCrJuGzxmJ32rBmnf352/0jwrwrhIb9XprUYliuvh0rzg7RG9O2gCQBg3fb2+q4vGx4LMFu6B5LNIAz3ALBApieAMvAzoGD1CSgWAlEJDi75ziAaPDP6qOirL5tFQ7PidscD46Pl5qMYDa3n0nTKr7gMNGM/3o/30iJsxaVXGtJ0IV7tvdbe9SRelz+b8V7+H//NCFG8swogAAAAAElFTkSuQmCC';
const replayIcon =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAOVBMVEUAAABAe/9Cev9AgP9Bev9Bev9Bev9AeP9Be/9Bev9Be/9Ce/9Bev9Be/9Aev9Aef9Cev9Aev9Ce/9T7oVaAAAAEnRSTlMAQIAQYPDgINDPoHDAsDBQkG/HXjLgAAAA00lEQVQ4y62TSZbDIAxENTAYx0O67n/YxiFEPHDsTf7Cz0AhVELQb1H+ExFWOseteLM4GuGEhsBEtK9NrMcxK9vrHBfyQIh8/lRmwLsm3ATMdKhs/xSpQbNCTMB5XTtDC2CCCT5SR/QmcMCJLzHBitBv54yvAq0/hkdBaopbJwgo7NXjWNcX8ZMNXXEveNwJLMkRs3kCLxtZoUY0YKabUjNdXJZ6LG2aqb/uVAKY0xT79ScZQ8sllAy7pn0evmJp2nl0jQYvlw8nOP329JzIzko/5R9iTgy3DxvgMgAAAABJRU5ErkJggg==';

class ControlPanel extends Component {
	constructor() {
		super();
		this.speedList = ['1x', '2x'];
	}
	onSetCurrentTime = currentTime => {
		this.props.onChangePlay({ currentTime });
	};
	onSetSpeed = speed => {
		this.props.onChangePlay({ speed });
	};
	onChangePlayStatus = playStatus => {
		const { currentTime, timeline } = this.props;
		if (playStatus !== 0 || currentTime >= timeline) {
			this.props.onPlayFn();
		} else {
			this.props.onPauseFn();
		}
	};
	genTimeStr = time => {
		const minute = parseInt(time / 60);
		const second = time - minute * 60;
		return `${minute > 10 ? minute : `0${minute}`}:${second > 10 ? second : `0${second}`}`;
	};
	render() {
		const { currentTime, timeline, playStatus, speed } = this.props;
		const listNodes = this.speedList.map((item, index) => {
			const className = speed == index + 1 ? 'active' : '';
			return (
				<div key={index} className={className} onClick={() => this.onSetSpeed(index + 1)}>
					{index + 1}x
				</div>
			);
		});
		const showIcon = playStatus === 2 ? replayIcon : playStatus !== 0 ? playIcon : pauseIcon;
		console.log('play status', playStatus);
		return (
			<div className="handwriting-control-panel">
				<div className="control-button" onClick={() => this.onChangePlayStatus(playStatus)}>
					<img src={showIcon} />
				</div>
				<div className="control-range">
					<div className="range-show">
						<DragInput
							playStatus={playStatus}
							currentTime={currentTime}
							timeline={timeline}
							handleChangeCurrentTime={this.onSetCurrentTime}
						/>
					</div>
					<div className="range-number">
						{this.genTimeStr(currentTime)}/{this.genTimeStr(timeline)}
					</div>
				</div>
				<div className="control-speed">
					倍速:
					{listNodes}
				</div>
			</div>
		);
	}
}
export default ControlPanel;
