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
					<button onClick={this.handleClick('half')}>halficon</button>
					<button onClick={this.handleClick('text')}>text</button>
					<button onClick={this.handleClick('rect')}>rect</button>
					<button onClick={this.handleClick('clear')}>clear</button>
				</div>
				<br />
				<DragCanvas
					scale={0.5}
					actionName={actionName}
					getDrawMap={this.getData}
					imgUrl="https://www.baidu.com/img/bd_logo1.png?width=540&height=258"
				/>
			</div>
		);
	}
}

export default SSS;
