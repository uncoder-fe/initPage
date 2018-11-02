import React from 'react';
import { convertToRaw } from 'draft-js';

import './my-img.less';

export default class MyImg extends React.Component {
    constructor() {
        super();
        this.state = {
            isEditor: false
        };
        this.ff = cs => {
            console.log(convertToRaw(cs));
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
                <div className="my-img">
                    <img src={src} alt="渲染图" onDoubleClick={this.handleDoubleClick} />
                    <div className={isEditor ? 'show-flex' : 'hide-none'}>
                        <button onClick={this.handleDel(block)}>删除</button>
                        <button onClick={this.handleCropShow(block)}>裁剪</button>
                    </div>
                </div>
            );
        }
        return null;
    }
}
