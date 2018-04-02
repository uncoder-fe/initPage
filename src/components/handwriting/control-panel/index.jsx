import React, { Component } from 'react';
import DragInput from './drag-input';
import playIcon from './img/play.png';
import pauseIcon from './img/pause.png';
import replayIcon from './img/replay.png';

import './index.less';

class ControlPanel extends Component {
	constructor() {
		super();
		this.speedList = ['1x', '2x', '3x'];
	}
	onSetRange = range => {
		const { speed } = this.props.config;
		this.props.config.fn({ range, speed });
	};
	onSetSpeed = speed => {
		const { range } = this.props.config;
		this.props.config.fn({ range, speed });
		// console.log(data);
	};
	onSetStatus = status => {
		const { playFn, pauseFn, range } = this.props.config;
		if (!status || range >= 100) {
			playFn();
		} else {
			pauseFn();
		}
	};
	render() {
		const { range, status, speed } = this.props.config;
		const { speedList } = this;
		const listNodes = speedList.map((item, index) => {
			const className = (speed == index + 1) ? 'active' : '';
			return <div className={className} onClick={() => this.onSetSpeed(index + 1)}>{index + 1}x</div >;
		});
		const icon = range >= 100 ? replayIcon : !status ? playIcon : pauseIcon;
		const showNumber = range.toFixed(0);
		return (
			<div className="handwriting-control-panel">
				<div className="control-button" onClick={() => this.onSetStatus(status)}>
					<img src={icon} />
				</div>
				<div className="control-range">
					<div className="range-show">
						<DragInput range={range} onChange={this.onSetRange} />
					</div>
					<div className="range-number">{`${showNumber}%`}</div>
				</div>
				<div className="control-speed">倍数:{listNodes}</div>
			</div>
		);
	}
}
export default ControlPanel;
