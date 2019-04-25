import React, { Component } from 'react';
import './drag-input.less';

class DragInput extends Component {
	constructor() {
		super();
		this.state = {
			currentTime: 0
		};
		this.status = false;
	}
	handleChangeCurrentTime = e => {
		const { timeline } = this.props;
		const { offsetX } = e.nativeEvent;
		const { offsetWidth } = e.target;
		const currentTime = parseInt((offsetX / offsetWidth) * timeline);
		// console.log("currentTime", currentTime)
		this.props.handleChangeCurrentTime(currentTime);
	};
	mousedown = e => {
		this.status = true;
		this.handleChangeCurrentTime(e);
	};
	mousemove = e => {
		if (this.status) {
			this.handleChangeCurrentTime(e);
		}
	};
	mouseup = () => {
		this.status = false;
	};
	mouseout = () => {
		this.status = false;
	};
	render() {
		const { playStatus, timeline, currentTime } = this.props;
		let range = 100;
		if (timeline != 0) {
			range = parseFloat(((currentTime / timeline) * 100).toFixed(3));
		}
		return (
			<div className="range-container-sss">
				<div
					className="range-touch-cover-sss"
					onMouseDown={this.mousedown}
					onMouseUp={this.mouseup}
					onMouseMove={this.mousemove}
					onMouseOut={this.mouseout}
				/>
				<div
					className="range-sss"
					style={{
						width: `${range}%`,
						transition: playStatus === 0 && range != 0 ? 'width 1s ease' : 'unset'
					}}
				>
					{range}
				</div>
			</div>
		);
	}
}

export default DragInput;
