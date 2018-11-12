import React from 'react';
import { Icon, Modal, message } from 'antd';
import { stateToHTML } from 'draft-js-export-html';

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
            textCount: 0,
            isCrop: false,
            cropUrl: '',
            cropBlock: {},
            editorState: EditorState.createEmpty()
        };
        this.ff = o => {
            console.log(convertToRaw(o));
        };
    }
    onChange = editorState => {
        const { getEditor } = this.props;
        const arryTextBlooks = editorState.getCurrentContent().getBlocksAsArray();
        let textCount = 0;
        arryTextBlooks.forEach(block => {
            if (block.getType() == 'unstyled') {
                textCount += block.getText().length;
            }
        });
        this.setState({ editorState, textCount }, () => {
            // console.log('onChange', convertToRaw(editorState.getCurrentContent()));
            const contentState = editorState.getCurrentContent();
            const htmlStr = stateToHTML(contentState);
            getEditor(htmlStr);
        });
    };
    // 图片文件上传服务器
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
    // 选择图片文件
    onChangefile = async e => {
        const file = e.target.files[0];
        const fileMaxSize = 2 * 1024 * 1024;
        if (!file) {
            return;
        }
        if (!/image\/\w+/.test(file.type)) {
            message.error('选择的文件不是图片');
            return;
        }
        if (file.size >= fileMaxSize) {
            message.error('图片过大');
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
    // 插入图片操作
    insertImage = imageUrl => {
        const { editorState } = this.state;
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity('image', 'IMMUTABLE', {
            text: '我是题目图片',
            src: imageUrl
        });
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
        this.setState(
            {
                editorState: AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, '我是插入的图片')
            },
            () => {
                setTimeout(() => {
                    this.myEditor.focus();
                    // 重置文件选中上传路径
                    this.uploadImg.value = '';
                }, 0);
            }
        );
    };
    // 删除图片操作
    handleDelteImg = block => {
        const blockKey = block.getKey();
        const blockLength = block.getLength();
        const { editorState } = this.state;
        const contentState = editorState.getCurrentContent();
        // 为这个block创建一个选中
        const selection = SelectionState.createEmpty(blockKey);
        const updatedSelection = selection.merge({
            anchorKey: blockKey,
            // anchorOffset is the start of the block
            anchorOffset: 0,
            focusKey: blockKey,
            // focustOffset is the end
            focusOffset: blockLength
        });
        // 为选中的block应用这个entry（key），若entry为null，则删除这个选中块的所有的entry
        const newContentState = Modifier.applyEntity(contentState, updatedSelection, null);
        // 更新editorState的contentState
        const newEditorState = EditorState.set(editorState, { currentContent: newContentState });
        // 移除所有在这个选中区间的文本，方向向后
        const contentStateWithoutBlock = Modifier.removeRange(newContentState, updatedSelection, 'backward');
        // 返回一个新的contentState，必须使用此方法将所有内容更改应用于EditorState
        const newEditorState2 = EditorState.push(newEditorState, contentStateWithoutBlock, 'remove-range');
        // 以上操作想法是对的，结果不太尽人意
        this.setState({
            editorState: newEditorState2
        });
    };
    // 显示裁剪工具
    handleCropShow = block => {
        const { editorState } = this.state;
        const contentState = editorState.getCurrentContent();
        const entity = contentState.getEntity(block.getEntityAt(0));
        const { src } = entity.getData();
        this.setState({
            isCrop: true,
            cropUrl: src,
            cropBlock: block
        });
    };
    // 裁剪图片
    handleCropImg = () => {
        this.cropper.getCorpperImage(async imgFile => {
            imgFile.name = `image-${Date.now()}.jpeg`;
            const url = await this.qiniuUp(imgFile).then(data => data);
            const { editorState, cropBlock } = this.state;
            // 获取当前的contentState
            const contentState = editorState.getCurrentContent();
            // 通过entryKey来修改数据
            const newContentState = contentState.mergeEntityData(cropBlock.getEntityAt(0), { src: url });
            const newEditorState = EditorState.set(editorState, { currentContent: newContentState });
            this.setState(
                {
                    isCrop: false,
                    editorState: newEditorState
                },
                () => {
                    setTimeout(() => this.myEditor.focus(), 0);
                }
            );
        });
    };
    // 取消裁剪
    handleCropCancel = () => {
        this.setState({
            isCrop: false
        });
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
                    handleCropShow: this.handleCropShow
                }
            };
        }
        return null;
    };
    render() {
        const { editorState, isCrop, cropUrl, textCount } = this.state;
        return (
            <div className="my-editor">
                <div className="editor-control">
                    <div className="img-select">
                        <div>
                            <Icon type="picture" theme="outlined" />
                            选择图片
                        </div>
                        <input
                            ref={file => (this.uploadImg = file)}
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={this.onChangefile}
                        />
                    </div>
                    <div className="word-number">
                        {textCount}
                        /1500字
                    </div>
                </div>
                <Editor
                    ref={editor => (this.myEditor = editor)}
                    editorState={editorState}
                    onChange={this.onChange}
                    blockRendererFn={this.myBlockRenderer}
                />
                <Modal
                    title="图片裁切"
                    width={500}
                    closable={false}
                    // mask={false}
                    destroyOnClose
                    visible={isCrop}
                    onOk={this.handleCropImg}
                    onCancel={this.handleCropCancel}>
                    <Crop ref={crop => (this.cropper = crop)} src={cropUrl} />
                </Modal>
            </div>
        );
    }
}
