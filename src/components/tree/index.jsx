import TreeNode from './tree-node';
import './index.less';

class Tree extends React.Component {
    constructor() {
        super();
        this.state = {
            treeData: [
                {
                    id: 1,
                    name: '1级目录1',
                    sons: [
                        { id: 21, name: '2级目录1' },
                        { id: 22, name: '2级目录2' },
                        {
                            id: 23,
                            name: '2级目录3',
                            sons: [
                                { id: 31, name: '3级目录1' },
                                { id: 32, name: '3级目录2' },
                                { id: 33, name: '3级目录3' },
                                { id: 34, name: '3级目录4' },
                                { id: 35, name: '3级目录5' }
                            ]
                        },
                        { id: 24, name: '2级目录4' },
                        { id: 25, name: '2级目录5' },
                        { id: 26, name: '2级目录6' }
                    ]
                },
                { id: 2, name: '1级目录2' },
                { id: 3, name: '1级目录3' },
                { id: 4, name: '1级目录4' },
                { id: 5, name: '1级目录5' },
                { id: 6, name: '1级目录6' }
            ],
            treeNode: []
        };
        this.restore = [];
    }
    componentDidMount() {
        const { treeData } = this.state;
        const treeNode = this.loop(treeData, true);
        this.setState({ treeNode });
    }
    componentDidUpdate() {
        // 渲染后传值
        // this.props.callback(this.restore)
    }
    onSelect(nodes, item, args) {
        // 隐藏同级
        nodes.forEach(ite => {
            ite.visibility = false;
        });
        // 子元素隐藏
        this.hideChildren(item.sons);
        // 当前元素
        item.visibility = !args;
        // 存储选择
        this.storeResult(item);
        // 刷新数据
        const { treeData } = this.state;
        const treeNode = this.loop(treeData, false);
        this.setState({
            treeData,
            treeNode
        });
    }
    hideChildren(arry) {
        if (arry && arry.length > 0) {
            arry.forEach(item => {
                const { sons } = item;
                item.visibility = false;
                if (sons && sons.length > 0) {
                    this.hideChildren(sons);
                }
            });
        }
    }
    loop(nodes, level = 0) {
        const { restore } = this;
        ++level;
        return nodes.map(item => {
            const { name, sons, id } = item;
            let { visibility } = item;
            item.level = level;
            // 最后点击的点高亮
            let highlight = false;
            if (restore.length > 0 && restore[restore.length - 1] == id) {
                highlight = true;
            }
            if (sons && sons.length > 0) {
                // console.log("父集::=>", name);
                const childrenNodes = this.loop(sons, level);
                if (restore.length > 0 && restore[level - 1] == id) {
                    item.visibility = true;
                    visibility = true;
                }
                return (
                    <TreeNode
                        key={id}
                        highlight={highlight}
                        level={level}
                        visibility={visibility || false}
                        title={name}
                        nodes={childrenNodes}
                        onSelect={() => this.onSelect(nodes, item, visibility || false)}
                    />
                );
            }
            // console.log("子集::=>", name);
            return (
                <TreeNode
                    key={id}
                    highlight={highlight}
                    level={level}
                    title={name}
                    onSelect={() => this.onSelect(nodes, item, visibility || false)}
                />
            );
        });
    }
    storeResult(item) {
        const { id, level } = item;
        const arry = this.restore.slice(0, level - 1);
        arry[level - 1] = id;
        this.restore = arry;
    }
    render() {
        // console.log("刷新tree")
        const { treeNode } = this.state;
        return <ul className="ul-tree">{treeNode}</ul>;
    }
}

export default Tree;
