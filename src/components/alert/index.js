import './index.less';

const alertContainer = document.createElement('div');

class Alert {
	static confirm(opt) {
		const options = opt;
		document.body.appendChild(alertContainer);
		ReactDOM.render(<Modal config={options} />, alertContainer);
	}
	static close() {
		ReactDOM.unmountComponentAtNode(alertContainer);
		document.body.removeChild(alertContainer);
	}
}

class Modal extends React.Component {
	handleConfirm = e => {
		const ok = this.props.config.onOk;
		if (ok) {
			ok(e);
		}
		Alert.close();
	};
	handleCancel = e => {
		const cancel = this.props.config.onCancel;
		if (cancel) {
			cancel(e);
		}
		Alert.close();
	};
	render() {
		const config = this.props.config;
		const title = config.title;
		const subTitle = config.subTitle;
		const content = config.content;
		const confimText = config.okText || '确定';
		const cancelText = config.cancelText || '取消';
		return (
			<div className="mask">
				<div className="modal-container">
					<p className="title">{title}</p>
					<p className="sub-title">{subTitle}</p>
					<p className="content">{content}</p>
					<div className="modal-buttons">
						<div onClick={this.handleCancel}>{cancelText}</div>
						<div onClick={this.handleConfirm}>{confimText}</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Alert;
