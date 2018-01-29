class Detail extends React.Component {
	render() {
		return <div>我是{this.props.match.params.id}</div>;
	}
}

export default Detail;
