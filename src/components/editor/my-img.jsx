import React from 'react';

export default class MyImg extends React.Component {
    constructor() {
        super();
        this.state = {
            isEditor: false
        };
    }
    handleDel = block => () => {
        const { blockProps } = this.props;
        blockProps.handleDelteImg(block);
    };
    handleCropShow = block => () => {
        const { blockProps } = this.props;
        blockProps.handleCropShow(block);
    };
    handleDoubleClick = () => {
        this.setState({
            isEditor: !this.state.isEditor
        });
    };
    render() {
        const { isEditor } = this.state;
        const { contentState, block } = this.props;
        if (block.getEntityAt(0) != null) {
            const entity = contentState.getEntity(block.getEntityAt(0));
            const { src } = entity.getData();
            return (
                <div className="my-cropper-img">
                    <img className={isEditor ? 'active' : ''} src={src} alt="渲染图" onClick={this.handleDoubleClick} />
                    <div className={isEditor ? 'my-cropper-img-buttons' : 'hide-none'}>
                        <div onClick={this.handleCropShow(block)}>裁剪</div>
                        <div onClick={this.handleDel(block)}>移除</div>
                    </div>
                </div>
            );
        }
        return null;
    }
}
