#! /bin/bash
# 系统 centos7
# 快速安装 nginx, ss, nodejs, yarn, pm2
#
# 使用方法：
# sh -c "$(curl -fsSL https://raw.githubusercontent.com/uncoder-fe/initPage/master/env_install.sh)"
#
# 修改脚本可执行权限 chmod u+x test.sh
# 查看安装路径 rpm -ql nginx
# $basearch是我们的系统硬件架构(CPU指令集)

main() {

# 全局变量
basearch=$(arch)
NGINX_VERSION=http://nginx.org/packages/centos/7/${basearch}/
SS_VERSION=https://copr.fedorainfracloud.org/coprs/librehat/shadowsocks/repo/epel-7/librehat-shadowsocks-epel-7.repo
NODEJS_VERSION=https://rpm.nodesource.com/setup_10.x
YARN_VERSION=https://dl.yarnpkg.com/rpm/yarn.repo

# 检测nginx是否安装
if type nginx >/dev/null 2>&1; then
    echo 'nginx已经存在...'
else
    echo 'nginx不存在，开始下载.....'
    echo -e "[nginx]\nname=nginx repo\nbaseurl=${NGINX_VERSION}\ngpgcheck=0\nenabled=1" > /etc/yum.repos.d/nginx.repo
    yum install nginx
    echo 'nginx安装完毕.....'
fi

# 检测ss是否安装
if type ss-server >/dev/null 2>&1; then
    echo 'ss已经存在...'
else
    echo 'ss不存在，开始下载.....'
    curl --location -o /etc/yum.repos.d/shadowsocks-libev.repo ${SS_VERSION}
    yum install shadowsocks-libev
    echo '配置文件路径：/etc/shadowsocks-libev/config.json'
    echo '服务路径：/usr/lib/systemd/system/shadowsocks-libev.service'
    echo '追加：ExecStart=/usr/bin/ss-server -c /etc/shadowsocks-libev/config.json'
    echo '追加：ExecReload=/bin/kill -HUP $MAINPID'
    echo '追加：ExecStop=/bin/kill -s QUIT $MAINPID'
    echo '追加：PrivateTmp=true'
    echo '追加：KillMode=process'
    echo 'ss安装完毕，请复制上面的追加内容，手工调整服务.....'
fi

# 检测nodejs是否安装
if type node >/dev/null 2>&1; then
    echo 'nodejs已经存在...'
else
    echo 'nodejs不存在，开始下载.....'
    curl --silent --location ${NODEJS_VERSION} | sudo bash -
    yum install nodejs
    echo 'nodejs安装完毕.....'
fi

# 检测yarn是否安装
if type yarn >/dev/null 2>&1; then
    echo 'yarn已经存在...'
else
    echo 'yarn不存在，开始下载.....'
    curl --silent --location ${YARN_VERSION} | sudo tee /etc/yum.repos.d/yarn.repo
    yum install yarn
    echo 'yarn安装完毕.....'
fi

# 检测pm2是否安装
if type pm2 >/dev/null 2>&1; then
    echo 'pm2已经存在...'
else
    echo 'pm2不存在，开始下载.....'
    yarn add pm2 -g
    echo 'pm2安装完毕.....'
fi

echo '安装已经全部结束....'

}

main