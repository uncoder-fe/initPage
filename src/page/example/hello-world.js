// 无状态组件，即只通过props来接受参数，本身无state
const Test = props => {
	return <h1>{props.text}</h1>;
};
export default Test;
