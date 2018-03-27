import React, { Component } from 'react';
import playIcon from './img/play.png';
import pauseIcon from './img/pause.png';
import './index.less';

class ControlPanel extends Component {
	constructor() {
		super();
		this.state = {
			range: 0,
			list: ['1x', '2x', '3x']
		};
	}
	onSetRange = e => {
		const { speed } = this.props.config;
		const range = parseInt(e.target.value);
		this.setState({ range }, () => {
			this.props.config.fn({ range, speed });
		});
	};
	onSetSpeed = speed => {
		const { range } = this.state;
		this.props.config.fn({ range, speed });
		// console.log(data);
	};
	onSetStatus = status => {
		const { playFn, pauseFn } = this.props.config;
		if (!status) {
			playFn();
		} else {
			pauseFn();
		}
	};
	componentWillReceiveProps(nextProms) {
		const { range } = nextProms.config;
		this.setState({ range });
	}
	componentDidMount() {
		const { range } = this.props.config;
		this.setState({ range });
	}
	render() {
		const { status, speed, step } = this.props.config;
		const { range, list } = this.state;
		const listNodes = list.map((item, index) => {
			const className = (speed == index + 1) ? 'active' : '';
			return <div className={className} onClick={() => this.onSetSpeed(index + 1)}>{index + 1}x</div >;
		});
		const className = `no-default-style color bar gradient-${range}`;
		return (
			<div className="handwriting-control-panel">
				<div className="control-button" onClick={() => this.onSetStatus(status)}>
					<img src={!status ? playIcon : pauseIcon} />
				</div>
				<div className="control-range">
					<div className="range-show"><input type="range" step={step} value={range} min="0" max="100" onChange={this.onSetRange} className={className} /></div>
					<div className="range-number">{`${range}%`}</div>
				</div>
				<div className="control-x">倍数:{listNodes}</div>
			</div>
		);
	}
}
export default ControlPanel;
