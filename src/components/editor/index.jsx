import React from 'react';
import {
	AtomicBlockUtils,
	SelectionState,
	Modifier,
	Editor,
	EditorState,
	ContentState,
	convertFromRaw,
	convertToRaw
} from 'draft-js';
import qnConfig from './config';
import MyImg from './my-img';
import Crop from './crop';
import './index.less';

export default class MyEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isCrop: false,
			editorState: EditorState.createEmpty(),
			url: ''
		};
		this.ff = o => {
			console.log(convertToRaw(o));
		};
	}
	onChange = editorState => {
		this.setState({ editorState }, () => {
			console.log('onChange', convertToRaw(editorState.getCurrentContent()));
		});
	};
	// 显示裁剪工具
	handleShowCrop = block => {
		const { contentState } = this.state;
		const entity = contentState.getEntity(block.getEntityAt(0));
		const { src } = entity.getData();
		this.setState({
			isCrop: true,
			url: src
		});
	};
	qiniuUp = imgSource => {
		const file = imgSource;
		const key = imgSource.name;
		const observable = window.qiniu.upload(file, key, qnConfig.uptoken, qnConfig.putExtra, qnConfig.config);
		return new Promise(resolve => {
			observable.subscribe({
				next(res) {
					// console.log(res);
				},
				error(err) {
					console.log(err);
				},
				complete: res => {
					const { key } = res;
					const imageUrl = qnConfig.domain + key;
					console.log('imageurl', imageUrl);
					resolve(imageUrl);
				}
			});
		});
	};
	uploadImg = async e => {
		const file = e.target.files[0];
		const fileMaxSize = 500000;
		if (!file) {
			return;
		}
		if (!/image\/\w+/.test(file.type)) {
			console.log('选择的文件不是图片');
			return;
		}
		if (file.size >= fileMaxSize) {
			console.log('文件过大');
			return;
		}
		const url = await this.qiniuUp(file).then(data => data);
		this.insertImage(url);
	};
	componentWillMount() {
		if (false) {
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
					0: {
						type: 'image',
						mutability: 'IMMUTABLE',
						data: {
							text: '![图片]()',
							src: 'http://phhwytweo.bkt.clouddn.com/3ef0a61fe5234429a03749a29851f6c0.jpeg'
						}
					}
				}
			};
			const blockArry = convertFromRaw(init);
			const editorState = EditorState.createWithContent(blockArry);
			this.setState({ editorState });
		} else {
			this.setState({ editorState: EditorState.createEmpty() });
		}
	}
	// 插入图片
	insertImage = imageUrl => {
		const { editorState } = this.state;
		const contentState = editorState.getCurrentContent();
		const contentStateWithEntity = contentState.createEntity('image', 'IMMUTABLE', {
			text: '我是题目图片',
			src: imageUrl
		});
		const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
		console.log('lastentityKey', entityKey);
		console.log(this.ff(contentStateWithEntity));
		const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
		this.setState(
			{
				editorState: AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, '我是插入的图片')
			},
			() => {
				setTimeout(() => {
					console.log('插入成功，获取焦点');
					this.myEditor.focus();
				}, 0);
			}
		);
	};
	// 删除图片
	handleDelteImg = block => {
		const blockKey = block.getKey();
		const blockLength = block.getLength();
		const { editorState } = this.state;
		const contentState = editorState.getCurrentContent();
		// You need to create a selection for entire length of text in the block
		const selection = SelectionState.createEmpty(blockKey);
		const updatedSelection = selection.merge({
			anchorKey: blockKey,
			// anchorOffset is the start of the block
			anchorOffset: 0,
			focusKey: blockKey,
			// focustOffset is the end
			focusOffset: blockLength
		});
		// 删除entry
		const newContentState = Modifier.applyEntity(contentState, updatedSelection, null);
		// const newEditorState = EditorState.push(editorState, newContentState, 'apply-entity');
		const newEditorState = EditorState.set(editorState, { currentContent: newContentState });
		// 删除block
		const contentStateWithoutBlock = Modifier.removeRange(newContentState, updatedSelection, 'backward');
		const newEditorState2 = EditorState.push(newEditorState, contentStateWithoutBlock, 'remove-range');
		// 以上操作想法是对的，结果不太尽人意
		this.setState(
			{
				editorState: newEditorState2
			},
			() => {
				console.log(
					'delete/convertFromRaw',
					JSON.stringify(convertToRaw(newEditorState2.getCurrentContent()).blocks.length)
				);
			}
		);
	};
	// 裁剪图片
	handleCropImg = async (block, imgFile) => {
		imgFile.name = `image-${Date.now()}.jpeg`;
		const url = await this.qiniuUp(imgFile).then(data => data);
		const { editorState } = this.state;
		const contentState = editorState.getCurrentContent();
		const rawObj = convertToRaw(contentState);
		const newContentState = contentState.mergeEntityData(block.getEntityAt(0), { src: url });
		const newEditorState = EditorState.set(editorState, { currentContent: newContentState });
		this.setState(
			{
				editorState: newEditorState
			},
			() => {
				setTimeout(() => {
					this.myEditor.focus();
				}, 0);
			}
		);
	};
	myBlockRenderer = contentBlock => {
		const type = contentBlock.getType();
		if (type == 'atomic') {
			return {
				// 指定组件
				component: MyImg,
				editable: false,
				props: {
					handleDelteImg: this.handleDelteImg,
					handleShowCrop: this.handleShowCrop
				}
			};
		}
		return null;
	};
	render() {
		const { editorState, isCrop, url } = this.state;
		return (
			<div className="my-editor">
				<div className="editor-control">
					<div>
						<label htmlFor="avatar">
							选择图片:
							<input
								id="avatar"
								type="file"
								accept="image/png, image/jpeg, image/jpg"
								onChange={this.uploadImg}
							/>
						</label>
					</div>
				</div>
				<Editor
					ref={editor => (this.myEditor = editor)}
					editorState={editorState}
					onChange={this.onChange}
					blockRendererFn={this.myBlockRenderer}
				/>
				<div className={isCrop ? 'show-block' : 'hide-none'}>
					<Crop src={url} handleCropImg={this.handleCropImg} />
				</div>
			</div>
		);
	}
}
