echo ---------------------------------------------
echo               send secret key
echo ---------------------------------------------
ssh -i deploy_rsa root@119.29.252.110 << eeooff
cd /root/baoleme-server
echo ---------------------------------------------
echo                  git pull
echo ---------------------------------------------
git pull
echo ---------------------------------------------
echo            install dependencies
echo ---------------------------------------------
npm i
echo ---------------------------------------------
echo              restart container
echo ---------------------------------------------
docker-compose
eeooff
echo ---------------------------------------------
echo                logout Server
echo ---------------------------------------------
