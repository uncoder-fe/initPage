import React from 'react';

export default class MyImg extends React.Component {
	handleClick = () => {
		// alert('hello world')
	};
	render() {
		const entity = this.props.contentState.getEntity(this.props.block.getEntityAt(0));
		const { src } = entity.getData();
		const type = entity.getType();
		console.log(src, type);
		return (
			<div className="my-img" onClick={this.handleClick}>
				<p>
					类型:
					{type}
				</p>
				<img src={src} alt="test" />
			</div>
		);
	}
}
