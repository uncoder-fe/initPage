/*
 * @Author: uncoder-fe
 * @Date: 2018-11-02 14:12:19
 * @Last Modified by: uncoder-fe
 * @Last Modified time: 2018-11-02 15:25:45
 */
import React, { Component } from 'react';
// import Api from 'common/service';

export default class Login extends Component {
	login = () => {
		// Api.login();
	};
	render() {
		return (
			<div>
				<div>
					<input type="text" />
					<input type="password" />
					<button onClick={this.login}>登陆</button>
					<button>忘记密码</button>
				</div>
			</div>
		);
	}
}
