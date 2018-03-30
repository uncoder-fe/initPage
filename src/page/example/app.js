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
