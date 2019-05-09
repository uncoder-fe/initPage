import DragCanvas from './index';

class SSS extends React.Component {
	constructor() {
		super();
		this.state = {
			action: ''
		};
	}
	handleClick = type => () => {
		this.setState({
			actionName: type
		});
	};
	getData = data => {
		console.log(data);
	};
	render() {
		const { actionName } = this.state;
		return (
			<div>
				<div>
					<button onClick={this.handleClick('right')}>righticon</button>
					<button onClick={this.handleClick('wrong')}>wrongicon</button>
					<button onClick={this.handleClick('text')}>text</button>
					<button onClick={this.handleClick('rect')}>rect</button>
					<button onClick={this.handleClick('clear')}>clear</button>
				</div>
				<br />
				<DragCanvas actionName={actionName} getDrawMap={this.getData} />
			</div>
		);
	}
}

export default SSS;
