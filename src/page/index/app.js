
class App extends React.Component {
	constructor() {
		super();
	}
	render() {
		return <div>hello world</div>;
	}
}

// 渲染
ReactDOM.render(<App />, document.querySelector("#app"));
