class TreeNode extends React.Component {
	onClick(event) {
		this.props.onSelect()
		event.stopPropagation()
	}
	render() {
		const {
			title, nodes, visibility, level, highlight
		} = this.props
		// 设置样式
		let classNames = `level-${level}`
		if (nodes && nodes.length > 0) {
			classNames += (visibility ? ' active' : ' normal')
		}
		if (highlight) {
			classNames += ' highlight'
		}
		return (
			<li className={classNames} onClick={event => this.onClick(event)}>
				<div className="item">
					{title || ''}
					<div className="background" />
				</div>
				{visibility ? <ul>{nodes}</ul> : null}
			</li>
		)
	}
}

export default TreeNode
