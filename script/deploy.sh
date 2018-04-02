ssh -i deploy_rsa root@119.29.252.110 << eeooff

cd /root/baoleme-server
git pull
docker kill baoleme-server
docker run -d --name baoleme-server --rm -v /root/baoleme-server:/server -p 8520:8520 node:alpine /bin/sh -c "ls /server && npm i /server && npm start --prefix /server"

eeooff