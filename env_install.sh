#! /bin/bash
# environment centos 7
# 快速安装 nodejs, yarn, pm2

# 检测nodejs是否安装

NODEJS_VERSION = https://rpm.nodesource.com/setup_10.x
YARN_VERSION = https://dl.yarnpkg.com/rpm/yarn.repo

if type node >/dev/null 2>&1; then
    echo 'exists nodejs'
else
    echo 'no exists nodejs'
    curl --silent --location ${NODEJS_VERSION} | sudo bash -
    yum install nodejs
fi

# 检测yarn是否安装

if type yarn >/dev/null 2>&1; then
    echo 'exists yarn'
else
    echo 'no exists yarn'
    curl --silent --location ${YARN_VERSION} | sudo tee /etc/yum.repos.d/yarn.repo
    yum install yarn
fi

# 检测pm2是否安装

if type pm2 >/dev/null 2>&1; then
    echo 'exists pm2'
else
    echo 'no exists pm2'
    yarn add pm2 -g
fi