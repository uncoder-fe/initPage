import React from 'react';
import { Icon, Modal, message } from 'antd';
import { stateToHTML } from 'draft-js-export-html';
import Api from 'service/upload';

import { AtomicBlockUtils, Editor, EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import MyImg from './my-img';
import Crop from './crop';
import './index.less';

export default class MyEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imageCount: 0,
            textCount: 0,
            isCrop: false,
            cropUrl: '',
            cropBlock: {},
            editorState: EditorState.createEmpty()
        };
        this.logState = () => {
            const content = this.state.editorState.getCurrentContent();
            console.log(convertToRaw(content));
        };
    }
    // 限制输入文本长度
    handleBeforeInput = (chars, editorState) => {
        const arryTextBlooks = editorState.getCurrentContent().getBlocksAsArray();
        let textCount = 0;
        arryTextBlooks.forEach(block => {
            if (block.getType() == 'unstyled') {
                textCount += block.getText().length;
            }
        });
        if (textCount >= 1500) {
            return 'handled';
        }
        return false;
    };
    // 限制粘贴文本长度
    handlePastedText = (text, html, editorState) => {
        const { textCount } = this.state;
        const status = this.handleBeforeInput(text, editorState);
        // 计算已经输入的长度，若粘贴的内容超过，禁止粘贴
        if (text.length + textCount >= 1500) {
            message.error('粘贴内容超过了限制字数，请删减');
            return true;
        }
        if (status == 'handled') {
            return true;
        }
        return false;
    };
    // 拷贝插入图片
    handlePastedImages = files => {
        // 校验上传图片数量
        if (this.state.imageCount >= 2) {
            message.error('只能上传两张图片哦');
            return 'handled';
        }
        this.onChangefile('', files[0]);
        return true;
    };
    // 拖拽插入图片
    handleDroppedImages = files => {
        // 校验上传图片数量
        if (this.state.imageCount >= 2) {
            return false;
        }
        this.onChangefile('', files[0]);
        return true;
    };
    onChange = editorState => {
        const { getEditor } = this.props;
        // 统计字数
        const arryTextBlooks = editorState.getCurrentContent().getBlocksAsArray();
        let textCount = 0;
        arryTextBlooks.forEach(block => {
            if (block.getType() == 'unstyled') {
                textCount += block.getText().length;
            }
        });
        // 统计图片数量
        const imageEntrys = convertToRaw(editorState.getCurrentContent()).entityMap;
        let imageCount = 0;
        Object.keys(imageEntrys).forEach(item => {
            if (imageEntrys[item].type === 'image') {
                imageCount += 1;
            }
        });
        this.setState({ editorState, textCount, imageCount }, () => {
            // console.log('onChange', convertToRaw(editorState.getCurrentContent()));
            const contentState = editorState.getCurrentContent();
            const contentStateStr = convertToRaw(contentState);
            const htmlStr = stateToHTML(contentState, {
                entityStyleFn: entity => {
                    const entityType = entity.get('type').toLowerCase();
                    if (entityType === 'image') {
                        const data = entity.getData();
                        return {
                            element: 'img',
                            attributes: {
                                src: data.src
                            },
                            style: {
                                margin: '18px 0'
                            }
                        };
                    }
                    return null;
                }
            });
            getEditor(htmlStr, contentStateStr, textCount);
            this.logState();
        });
    };
    // 点击上传图片
    onClickFile = event => {
        // 校验上传图片数量
        if (this.state.imageCount >= 2) {
            event.preventDefault();
            message.error('只能上传两张图片哦');
        }
    };
    // 点击选择图片按钮
    selectImage = () => {
        if (this.state.imageCount < 2) {
            this.uploadImg.click();
        }
    };
    // 选中图片
    onChangefile = async (event, df) => {
        const file = df || event.target.files[0];
        if (!file) {
            return;
        }
        if (!/image\/\w+/.test(file.type)) {
            message.error('选择的不是图片');
            return;
        }
        if (file.size >= 2 * 1024 * 1024) {
            message.error('图片大小不能超过2MB');
            return;
        }
        const hide = message.loading('图片上传中', 0);
        const resData = await Api.uploadImg(file);
        hide();
        if (resData.success) {
            this.insertImage(resData.data.path);
        }
    };
    // 插入图片
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
                // 图片计数
                imageCount: this.state.imageCount + 1,
                editorState: AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ')
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
    // 删除图片
    handleDelteImg = atomicBlock => {
        const { editorState } = this.state;
        const contentState = editorState.getCurrentContent();
        // this is the important one that actually deletes a block
        const newBlockMap = contentState.blockMap.delete(atomicBlock.getKey());
        const newContentState = contentState.set('blockMap', newBlockMap);
        const newEditorState = EditorState.push(editorState, newContentState, 'remove-block');
        this.setState({
            // 图片计数
            imageCount: this.state.imageCount - 1,
            editorState: newEditorState
        });
    };
    // handleDelteImg = (block) => {
    //     const blockKey = block.getKey();
    //     const blockLength = block.getLength();
    //     const { editorState } = this.state;
    //     const contentState = editorState.getCurrentContent();
    //     // 为这个block创建一个选中
    //     const selection = SelectionState.createEmpty(blockKey);
    //     const updatedSelection = selection.merge({
    //         anchorKey: blockKey,
    //         // anchorOffset is the start of the block
    //         anchorOffset: 0,
    //         focusKey: blockKey,
    //         // focustOffset is the end
    //         focusOffset: blockLength,
    //     });
    //     // 为选中的block应用这个entry（key），若entry为null，则删除这个选中块的所有的entry
    //     const newContentState = Modifier.applyEntity(contentState, updatedSelection, null);
    //     // 更新editorState的contentState
    //     const newEditorState = EditorState.set(editorState, { currentContent: newContentState });
    //     // 移除所有在这个选中区间的文本，方向向后
    //     const contentStateWithoutBlock = Modifier.removeRange(newContentState, updatedSelection, 'backward');
    //     // 返回一个新的contentState，必须使用此方法将所有内容更改应用于EditorState
    //     const newEditorState2 = EditorState.push(newEditorState, contentStateWithoutBlock, 'remove-range');
    //     // 以上操作想法是对的，结果不太尽人意
    //     this.setState({
    //         // 图片计数
    //         imageCount: this.state.imageCount - 1,
    //         editorState: newEditorState2,
    //     });
    // };
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
            const hide = message.loading('图片上传中', 0);
            const resData = await Api.uploadImg(imgFile);
            hide();
            if (resData.status == 0) {
                const url = resData.data.path;
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
            } else {
                message.error(resData.msg);
            }
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
    handleFocus = () => {
        this.myEditor.focus();
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
    componentDidMount() {
        this.myEditor.focus();
        // chrome 浏览器需要dragover，dragenter阻止默认才能触发drop事件
        this.myEditorContainer.addEventListener(
            'dragover',
            event => {
                // 阻止默认动作
                event.preventDefault();
            },
            false
        );
        this.myEditorContainer.addEventListener(
            'dragenter',
            event => {
                // 阻止默认动作
                event.preventDefault();
            },
            false
        );
        this.myEditorContainer.addEventListener(
            'drop',
            event => {
                // 阻止默认动作（如打开一些元素的链接,打开图片）
                event.preventDefault();
                const files = event.dataTransfer.files;
                this.handleDroppedImages(files);
            },
            false
        );
    }
    render() {
        const { editorState, isCrop, cropUrl, textCount, imageCount } = this.state;
        // If the user changes block type before entering any text, we can
        // either style the placeholder or hide it. Let's just hide it now.
        let className = 'RichEditor-editor';
        const contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) {
            if (
                contentState
                    .getBlockMap()
                    .first()
                    .getType() !== 'unstyled'
            ) {
                className += ' RichEditor-hidePlaceholder';
            }
        }
        return (
            <div
                className="my-editor"
                onClick={this.handleFocus}
                ref={editorContainer => (this.myEditorContainer = editorContainer)}>
                <div className="editor-control">
                    <div className="img-select">
                        <div onClick={this.selectImage} className={imageCount >= 2 ? 'disable' : ''}>
                            <Icon type="picture" theme="outlined" />
                            插入图片
                        </div>
                        <input
                            ref={file => (this.uploadImg = file)}
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={this.onChangefile}
                            onClick={this.onClickFile}
                        />
                    </div>
                    <div className="word-number">
                        {textCount}
                        /1500字
                    </div>
                </div>
                <div className={className}>
                    <Editor
                        ref={editor => (this.myEditor = editor)}
                        editorState={editorState}
                        onChange={this.onChange}
                        handleBeforeInput={this.handleBeforeInput}
                        handlePastedText={this.handlePastedText}
                        handlePastedFiles={this.handlePastedImages}
                        blockRendererFn={this.myBlockRenderer}
                        placeholder="可输入文字或插入图片，也可直接复制粘贴"
                    />
                </div>
                <Modal
                    title="图片裁切"
                    width={600}
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
