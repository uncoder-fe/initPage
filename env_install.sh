#! /bin/bash
# environment centos 7
# 快速安装 nginx, nodejs, yarn, pm2

# 修改脚本可执行权限 chmod u+x test.sh
# 查看安装路径 rpm -ql nginx
# $basearch是我们的系统硬件架构(CPU指令集), 使用命令arch得到

# 全局变量
basearch=$(arch)
NGINX_VERSION=http://nginx.org/packages/centos/7/${basearch}/
NODEJS_VERSION=https://rpm.nodesource.com/setup_10.x
YARN_VERSION=https://dl.yarnpkg.com/rpm/yarn.repo

# 检测nginx是否安装
if type nginx >/dev/null 2>&1; then
    echo 'exists nginx'
else
    echo 'no exists nginx'
    echo -e "[nginx]\n\name=nginx repo\nbaseurl=${NGINX_VERSION}\ngpgcheck=0\nenabled=1" > /etc/yum.repos.d/nginx.repo
    yum install nginx
fi

# 检测nodejs是否安装
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