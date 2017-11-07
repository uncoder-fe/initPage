
class Page extends React.Component {
	constructor () {
		super()
		this.state = {
			latex: ''
		}
	}
	componentWillMount () {
		this.setState({
			latex: '<p>\r\nWhen $a \\ne 0$, there are two solutions to \\(ax^2 + bx + c = 0\\) and they are\r\n$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.$$\r\n<\/p>'
		})
	}
	componentDidMount () {
		if (MathJax) {
			MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.latexNode])
		}
	}
	createMarkup (str) {
		return { __html: str }
	}
	render () {
		const { latex } = this.state
		return (
			<div ref={((node) => { this.latexNode = node })} dangerouslySetInnerHTML={this.createMarkup(latex)} ></div>
		)
	}
}

export default Page
