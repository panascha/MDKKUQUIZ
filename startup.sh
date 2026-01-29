#!/bin/sh

PATH=/root/.nvm/versions/node/v24.12.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin

cd /home/ubuntu/MDKKUQUIZ


echo $(pwd)

echo $(whoami)

echo $PATH

npm run start

