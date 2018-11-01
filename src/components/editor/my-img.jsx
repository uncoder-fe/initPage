import React from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

import './my-img.less';

export default class MyImg extends React.Component {
	constructor() {
		super();
		this.state = {
			isEitor: false,
			isCrop: false
		};
		this.cropper = null;
	}
	handleDel = block => () => {
		const { blockProps } = this.props;
		blockProps.del(block);
	};
	handleDoubleClick = event => {
		event.stopPropagation();
		this.setState({
			isEitor: !this.state.isEitor
		});
	};
	handleShowCrop = event => {
		event.stopPropagation();
		this.setState({
			isEitor: false,
			isCrop: !this.state.isCrop
		});
	};
	handleCrop = is => () => {
		this.setState(
			{
				isCrop: false
			},
			() => {
				if (is) {
					const { blockProps, block } = this.props;
					this.cropper.getCroppedCanvas().toBlob(
						blob => {
							blockProps.crop(block, blob);
						},
						'image/jpeg',
						1
					);
				}
			}
		);
	};
	componentDidMount = () => {
		const image = this.img;
		// debugger
		this.cropper = new Cropper(image, {
			aspectRatio: 16 / 9,
			viewMode: 2,
			minContainerWidth: 500,
			minContainerHeight: 350
		});
	};
	render() {
		const { isEitor, isCrop } = this.state;
		const { contentState, block } = this.props;
		if (block.getEntityAt(0) != null) {
			const entity = contentState.getEntity(block.getEntityAt(0));
			const { src } = entity.getData();
			return (
				<div className="my-img">
					<img src={src} alt="渲染图" onDoubleClick={this.handleDoubleClick} />
					<div className={isEitor ? 'show-flex' : 'hide-none'}>
						<button onClick={this.handleDel(block)}>删除</button>
						<button onClick={this.handleShowCrop}>裁剪</button>
					</div>
					<div className={`${isCrop ? 'show-flex' : 'hide-none'} my-crop-container`}>
						<div className="crop-container">
							<h3>图片裁切</h3>
							<div className="crop-img">
								<img src={src} crossOrigin="Anonymous" alt="裁切图" ref={img => (this.img = img)} />
							</div>
							<div className="buttons">
								<div className="button">
									<span onClick={this.handleCrop(false)}>取消</span>
								</div>
								<div className="button">
									<span onClick={this.handleCrop(true)}>裁切</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			);
		}
		return null;
	}
}
