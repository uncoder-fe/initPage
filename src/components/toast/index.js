import "./index.less";
// 创建定时器
let toastTimer = null;
// 创建容器
const toastContainer = document.createElement("div");

class Com extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		const content = this.props.content;
		return (<div className="toast-sss">
			<div><p>{content}</p></div>
		</div>);
	}
}

class Toast {
	static info(string) {
		if (toastTimer) { return; }
		document.body.appendChild(toastContainer);
		ReactDOM.render(<Com content={string} />, toastContainer);
		toastTimer = setTimeout(() => {
			this.hidden();
		}, 1500);
	}
	static hidden() {
		toastTimer = null;
		ReactDOM.unmountComponentAtNode(toastContainer);
		document.body.removeChild(toastContainer);
	}
}

export default Toast;
