import { HashRouter, Route, Switch, Link } from 'react-router-dom';
import IndexPage from './index';
import detailPage from './detail';

const App = () => (
	<HashRouter>
		<div className="viewport">
			<div>我是header不会变</div>
			<nav>
				<Link to="/detail/1">去详情</Link>
			</nav>
			<section>
				<Switch>
					<Route path="/" exact component={IndexPage} />
					<Route path="/detail/:id" component={detailPage} />
				</Switch>
			</section>
		</div>
	</HashRouter>
);

// 渲染
ReactDOM.render(<App />, document.querySelector('#app'));

const App2 = class extends React.Component {
	constructor() {
		super();
		this.state = {
			list: []
		};
	}
	componentDidMount() {
		setInterval(() => {
			const { list } = this.state;
			list.push(Date.now());
			this.setState({ list });
		}, 5000);
	}
	render() {
		const { list } = this.state;
		const listNodes = list.map((item, index) => {
			return <h1 key={index}>{item}</h1>;
		});
		return <div>我是第二个app{listNodes}</div>;
	}
};

ReactDOM.render(<App2 />, document.querySelector('#app2'));
