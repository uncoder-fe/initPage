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
		this.state = {
			editorState: EditorState.createEmpty()
		};
	}
	componentWillMount() {
		const init = {
			blocks: [
				{
					key: '4d5od',
					text: '',
					type: 'unstyled',
					depth: 0,
					inlineStyleRanges: [],
					entityRanges: [],
					data: {}
				},
				{
					key: 'an8bv',
					text: ' ',
					type: 'atomic',
					depth: 0,
					inlineStyleRanges: [],
					entityRanges: [{ offset: 0, length: 1, key: 0 }],
					data: {}
				},
				{
					key: '2u2of',
					text: '',
					type: 'unstyled',
					depth: 0,
					inlineStyleRanges: [],
					entityRanges: [],
					data: {}
				}
			],
			entityMap: {
				'0': {
					type: 'image',
					mutability: 'IMMUTABLE',
					data: { text: '![图片]()', src: 'https://www.baidu.com/img/bd_logo1.png' }
				}
			}
		};
		const blockArry = convertFromRaw(init);
		const editorState = EditorState.createWithContent(blockArry);
		this.setState({ editorState });
	}
	insertImage = img => {
		const { editorState } = this.state;
		const contentState = editorState.getCurrentContent();
		const contentStateWithEntity = contentState.createEntity('image', 'IMMUTABLE', {
			text: '裁剪图片',
			src: 'https://www.baidu.com/img/bd_logo1.png'
		});
		const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
		const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
		this.setState(
			{
				editorState: AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ')
			},
			() => {
				setTimeout(() => this.myEditor.focus(), 0);
			}
		);
	};
	onChange = editorState => {
		this.setState({ editorState }, () => {
			console.log('convertFromRaw', JSON.stringify(convertToRaw(editorState.getCurrentContent())));
		});
	};
	myBlockRenderer = contentBlock => {
		const type = contentBlock.getType();
		if (type == 'atomic') {
			return {
				// 指定组件
				component: MyImg,
				editable: false
			};
		}
		return null;
	};
	render() {
		const { editorState } = this.state;
		return (
			<div style={styles.editor}>
				<div>
					<div onClick={this.insertImage}>图片</div>
				</div>
				<Editor
					ref={editor => (this.myEditor = editor)}
					editorState={editorState}
					onChange={this.onChange}
					blockRendererFn={this.myBlockRenderer}
				/>
			</div>
		);
	}
}
