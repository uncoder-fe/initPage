import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import HomePage from './home';
import LoginPage from './login';

import './app.less';

const checkLogin = () => {
    try {
        const user = window.localStorage.getItem('user');
        const { token } = JSON.parse(user) || '';
        const loggedIn = token;
        if (true) {
            return <Redirect to="/home" />;
        }
        return <Redirect to="/login" />;
    } finally {
        //
    }
};

const App = () => (
    <HashRouter>
        <Switch>
            <Route path="/" exact render={checkLogin} />
            <Route path="/home" exact component={HomePage} />
            <Route path="/login" component={LoginPage} />
        </Switch>
    </HashRouter>
);

// 渲染
ReactDOM.render(<App />, document.querySelector('#app'));

const App2 = class extends React.Component {
    time = Date.now();
    static Test = class {
        constructor() {
            console.log('Test class');
        }
    };
    constructor() {
        super();
        this.state = {
            list: []
        };
        this.test = new this.constructor.Test();
        console.log(this.time);
    }
    componentDidMount() {
        setTimeout(() => {
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
        return (
            <div>
                我是第二个app
                {this.time}
                {listNodes}
            </div>
        );
    }
};

// ReactDOM.render(<App2 />, document.querySelector('#app2'));

function App3(props) {
    return (
        <div>
            我是第
            {props.name}
            个app
            {Date.now()}
        </div>
    );
}

// setInterval(() => {
// 	ReactDOM.render(<App3 name="三" />, document.querySelector('#app3'));
// }, 3000);

const App4 = <div>我是第四个app</div>;

// ReactDOM.render(App4, document.querySelector('#app4'));
