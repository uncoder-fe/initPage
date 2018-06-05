import React, { Component } from 'react';
import './drag-input.less';

class DragInput extends Component {
	constructor() {
		super();
		this.status = false;
	}
	wow = e => {
		const { onChange } = this.props;
		const { offsetX } = e.nativeEvent;
		const { offsetWidth } = e.target;
		const range = parseInt(100 * (offsetX / offsetWidth));
		onChange(range);
	};
	mousedown = e => {
		this.status = true;
		this.wow(e);
	};
	mousemove = e => {
		if (this.status) {
			this.wow(e);
		}
	};
	mouseup = () => {
		this.status = false;
	};
	mouseout = () => {
		this.status = false;
	};
	render() {
		const { range } = this.props;
		return (
			<div className="range-container-sss">
				<div
					className="range-touch-cover-sss"
					onMouseDown={this.mousedown}
					onMouseUp={this.mouseup}
					onMouseMove={this.mousemove}
					onMouseOut={this.mouseout}
				/>
				<div className="range-sss" style={{ width: `${range}%` }}>
					{range}
				</div>
			</div>
		);
	}
}

export default DragInput;
