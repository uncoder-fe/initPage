import './index.less';

class ControlPanel extends React.Component {
	constructor() {
		super();
		this.state = {
			range: 0,
			list: ['1x', '2x', '3x']
		};
	}
	onChange = e => {
		const { speed } = this.props;
		const range = e.target.value;
		this.setState({ range });
		this.props.fn({ range, speed });
		// console.log(range);
	};
	onSetSpeed = speed => {
		const { range } = this.state;
		this.props.fn({ range, speed });
		// console.log(data);
	};
	componentDidMount() {
		const { range } = this.props;
		this.setState({ range });
	}
	render() {
		const { speed } = this.props;
		const { range, list } = this.state;
		const listNodes = list.map((item, index) => {
			const className = (speed == index + 1) ? 'active' : '';
			return <div className={className} onClick={() => this.onSetSpeed(index + 1)}>{index + 1}x</div >;
		});
		return (
			<div className="control-panel">
				<div className="control-range">
					<input type="range" value={range} min="0" max="100" step="10" onChange={this.onChange} />
				</div>
				<div className="control-x">{listNodes}</div>
			</div>
		);
	}
}
export default ControlPanel;