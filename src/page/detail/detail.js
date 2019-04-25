class Detail extends React.Component {
	render() {
		const { match } = this.props;
		return (
			<div>
				我是
				{match.params.id}
			</div>
		);
	}
}

export default Detail;
