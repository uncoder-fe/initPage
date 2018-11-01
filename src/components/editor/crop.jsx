import React, { Component } from 'react';

import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

export default class Crop extends Component {
	constructor() {
		super();
		this.state = {
			isEitor: false,
			isCrop: false
		};
		this.cropper = null;
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.src !== this.props.src) {
			this.cropper
				.reset()
				.clear()
				.replace(nextProps.src);
		}
	}
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
	handleCrop = is => {
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
		this.setState({
			isCrop: false
		});
	};

	render() {
		const { isCrop } = this.state;
		const { src } = this.prps;
		return (
			<div className={`${isCrop ? 'show-flex' : 'hide-none'} my-crop-container`}>
				<div className="crop-container">
					<h3>图片裁切</h3>
					<div className="crop-img">
						<img src={src} crossOrigin="Anonymous" alt="裁切图" ref={img => (this.img = img)} />
					</div>
					<div className="buttons">
						<div className="button">
							<span onClick={() => this.handleCrop(false)}>取消</span>
						</div>
						<div className="button">
							<span onClick={() => this.handleCrop(true)}>裁切</span>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
