import React from 'react';

export default class MyImg extends React.Component {
	handleClick = () => {
		// alert('hello world')
	};
	render() {
		const { contentState, block } = this.props;
		if (block.getEntityAt(0) != null) {
			const entity = contentState.getEntity(block.getEntityAt(0));
			const { src } = entity.getData();
			const type = entity.getType();
			return (
				<div className="my-img" onClick={this.handleClick}>
					<img src={src} alt="test" />
				</div>
			);
		}
		return null;
	}
}
