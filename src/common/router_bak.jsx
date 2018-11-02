import React from 'react';
import { Platform, StyleSheet, Text, ScrollView, View } from 'react-native';
import AppBar from '../common/component/app-bar';
import BottomBar from '../common/component/bottom-bar';

import Home from '../page/home';
import Secret from '../page/secret';
import Preview from '../page/preview';

// 注册菜单以及页面
const routers = [
    { title: '记账', component: <Home />, nav: true },
    { title: '秘语', component: <Secret />, nav: true, active: true },
    { title: '预览', component: <Preview /> }
];

class Router extends React.Component {
    constructor() {
        super();
        this.state = {
            routers,
            pageStack: [],
            currentPage: null
        };
    }
    push = (title, params) => {
        const { routers, pageStack } = this.state;

        // 选中的页面
        const page = routers.find(item => item.title == title);
        pageStack.push(page);

        // 更新历史页面
        this.setState({
            pageStack,
            currentPage: React.cloneElement(page.component, {
                ...params,
                router: this
            })
        });
    };

    pop = () => {
        let { pageStack } = this.state;
        let page = null;
        if (pageStack.length == 1) {
            page = pageStack[0];
        } else {
            pageStack.pop();
            page = pageStack[pageStack.length - 1];
        }
        // 更新
        this.setState({
            pageStack,
            currentPage: React.cloneElement(page.component, { router: this })
        });
    };

    changeNav = title => {
        const { routers, pageStack } = this.state;

        // 激活
        routers.forEach(item => {
            item.active = item.title == title;
        });

        this.setState(
            {
                routers,
                pageStack
            },
            () => {
                this.push(title);
            }
        );
    };
    componentWillMount() {
        const { routers } = this.state;
        let initPage = routers.find(item => item.active == true) || routers[0];
        routers.forEach(item => {
            if (initPage.title == item.page) {
                item.active = true;
            }
        });

        this.setState({ routers }, () => {
            this.push(initPage.title);
        });
    }
    render() {
        const { routers, currentPage } = this.state;
        return (
            <View style={styles.contextCanvas}>
                <View style={styles.topView}>
                    <AppBar title="我的爱啪啪" back={false} />
                </View>
                <ScrollView style={styles.mainView}>{currentPage}</ScrollView>
                <View style={styles.bottomView}>
                    <BottomBar data={routers} onPress={this.changeNav} />
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    contextCanvas: {
        flex: 1,
        height: '100%',
        width: '100%',
        backgroundColor: '#fff'
    },
    topView: {
        height: 50
    },
    mainView: {
        flex: 1
    },
    bottomView: {
        height: 50
    }
});
export default Router;
