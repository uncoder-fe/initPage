import React from 'react';

export default class MyImg extends React.Component {
	handleClick = () => {
		// alert('hello world')
	};
	render() {
		// console.log('this.props', this.props);
		const { blockProps } = this.props;
		const { src } = blockProps;
		return (
			<div className="my-img" onClick={this.handleClick}>
				<img src={src} alt="test" />
			</div>
		);
	}
}
