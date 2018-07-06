echo ---------------------------------------------
echo                login Server
echo ---------------------------------------------
ssh -i deploy_rsa root@119.29.252.110 << eeooff
cd /root/baoleme/server
echo ---------------------------------------------
echo                  git pull
echo ---------------------------------------------
git checkout -- package-lock.json
git pull
echo ---------------------------------------------
echo            install dependencies
echo ---------------------------------------------
npm i
echo ---------------------------------------------
echo              restart container
echo ---------------------------------------------
cd /root/baoleme/nginx/baoleme
docker-compose restart
eeooff
echo ---------------------------------------------
echo                logout server
echo ---------------------------------------------
