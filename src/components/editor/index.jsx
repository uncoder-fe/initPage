import React from 'react';
import { AtomicBlockUtils, Editor, EditorState, convertFromRaw, convertToRaw } from 'draft-js';

import MyImg from './my-img';

const styles = {
	editor: {
		border: '1px solid gray',
		minHeight: '6em'
	}
};

export default class MyEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentWillMount() {
		const init = {
			blocks: [
				{
					text: '这里是文本内容，下面是一张图片',
					type: 'unstyled'
				},
				{
					text: '![图片](https://avatars2.githubusercontent.com/u/9550456?v=4&s=460)',
					type: 'atomic'
				}
			],
			entityMap: {}
		};
		const blockArry = convertFromRaw(init);
		this.setState({
			editorState: EditorState.createWithContent(blockArry)
		});
	}
	insertImage = img => {
		const { editorState } = this.state;
		const contentState = editorState.getCurrentContent();
		const contentStateWithEntity = contentState.createEntity('image', 'IMMUTABLE', {
			text: '![图片](https://avatars2.githubusercontent.com/u/9550456?v=4&s=460)',
			type: 'atomic'
		});
		const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
		const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
		const ned = AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey);
		console.log('editorState', convertToRaw(newEditorState.getCurrentContent()).blocks[0]);
		this.setState({
			editorState: ned
		});
	};
	setEditor = editor => {
		this.editor = editor;
	};
	onChange = editorState => {
		console.log(editorState, 'onchange');
		this.setState({ editorState });
	};
	myBlockRenderer = contentBlock => {
		// 获取到contentBlock的文本信息，可以用contentBlock提供的其它方法获取到想要使用的信息
		const type = contentBlock.getType();
		if (type == 'atomic') {
			const text = contentBlock.getText();
			// 获取图片的URL
			const matches = text.match(/!\[(.*)\]\((http.*)\)/);
			return {
				// 指定组件
				component: MyImg,
				// 这里设置自定义的组件可不可以编辑，因为是图片，这里选择不可编辑
				editable: true,
				// 这里的props在自定义的组件中需要用this.props.blockProps来访问
				props: {
					src: matches[2]
				}
			};
		}
		return null;
	};
	render() {
		const { editorState } = this.state;
		return (
			<div style={styles.editor}>
				<div>
					<div className="RichEditor-controls">
						<div onClick={this.insertImage}>图片</div>
					</div>
				</div>
				<Editor
					ref={this.setEditor}
					editorState={editorState}
					onChange={this.onChange}
					blockRendererFn={this.myBlockRenderer}
				/>
			</div>
		);
	}
}
