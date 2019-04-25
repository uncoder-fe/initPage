import React, { Component } from 'react';

import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import './crop.less';

export default class Crop extends Component {
	constructor() {
		super();
		this.cropper = null;
	}
	getCorpperImage = cb => {
		this.cropper.getCroppedCanvas().toBlob(
			blob => {
				cb(blob);
			},
			'image/jpeg',
			1
		);
	};
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
			aspectRatio: 'free',
			viewMode: 2,
			minContainerWidth: 500,
			minContainerHeight: 350
		});
	};

	render() {
		const { src } = this.props;
		return (
			<div className="crop-container">
				<img src={src} crossOrigin="Anonymous" alt="裁切图" ref={img => (this.img = img)} />
			</div>
		);
	}
}
