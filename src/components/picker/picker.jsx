import React, { Component } from 'react';
import './picker.less';

class PickerDiff extends Component {
	constructor() {
		super();
		this.state = {
			handleKey: null,
			visibility: false,
			value: '',
			list: []
		};
	}
	componentWillMount() {
		const randomKey = Math.random()
			.toString(36)
			.slice(2);
		this.setState({
			list: this.props.list,
			value: this.props.value,
			handleKey: randomKey
		});
	}
	handleFocus = event => {
		const { classname, dataset } = event.target.parentElement;
		const { handleKey } = this.state;
		if (classname != 'picker' && handleKey != dataset.handlekey) {
			this.setState({
				visibility: false
			});
		}
	};
	componentDidMount() {
		document.addEventListener('click', this.handleFocus);
	}
	componentWillUnmount() {
		document.removeEventListener(this.handleFocus);
	}
	componentWillReceiveProps(nextProps) {
		// console.log("next",nextProps)
		this.setState({
			visibility: false,
			list: nextProps.list,
			value: nextProps.value
		});
	}
	onshow(e, visibility) {
		this.setState({
			visibility: !visibility
		});
	}
	onselectpicker(item) {
		// console.error(item);
		this.setState({
			visibility: false
		});
		this.props.onSelect(item.key);
	}
	handleBlur() {
		this.setState({
			visibility: false
		});
	}
	render() {
		const { visibility, list, value, handleKey } = this.state;
		let title = '全部';
		const pickerList = list.map(item => {
			const { key, name } = item;
			let select = false;
			if (value === key) {
				title = name;
				select = true;
			}
			return (
				<li key={key} onClick={() => this.onselectpicker(item)} className={select ? 'active' : ''}>
					{name}
				</li>
			);
		});
		return (
			<a className="picker" onBlur={() => this.handleBlur()} data-handleKey={handleKey}>
				<span className={visibility ? 'active' : ''} onClick={e => this.onshow(e, visibility)}>
					{title}
				</span>
				{visibility ? <ul>{pickerList}</ul> : null}
			</a>
		);
	}
}

export default PickerDiff;
