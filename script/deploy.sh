echo ---------------------------------------------
echo             sending secret key
echo ---------------------------------------------
ssh -i deploy_rsa root@119.29.252.110 << eeooff

cd /root/baoleme-server
echo ---------------------------------------------
echo                git pull
echo ---------------------------------------------
git pull
echo ---------------------------------------------
echo             delete old container
echo ---------------------------------------------
docker rm -f baoleme-server
echo ---------------------------------------------
echo              start new container
echo ---------------------------------------------
docker run -d --name baoleme-server --rm -v /root/baoleme-server:/server -p 8520:8520 node:alpine /bin/sh -c "npm i /server && npm start --prefix /server"

eeooff
echo ---------------------------------------------
echo                logout Server
echo ---------------------------------------------
