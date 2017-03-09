# crewing

Helps to gather people and plan missions


## Run devlopment version

Install [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/). Then clone this repo and run:

```sh
npm install

# edit environment variables
cp env.sample .env
vim .env

# depending on your setting, start mongo and put the database in the current dir
npm run mongo

# start keystone
npm start

# change the default users password!
```


## Run in production

- [How To Set Up a Node.js Application for Production on Debian 8](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-debian-8)
- [How to Install MongoDB on Debian 8](https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-debian-8)
- [How To Secure Nginx with Let's Encrypt on Debian 8](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-debian-8)

```sh
git clone https://github.com/cadus/crewing
cd crewing
npm install
pm2 start index.js --name "crewing"
```


## Backup and restore the database

```sh
# Backup file
mongodump --db crewing --gzip --archive=crewing.gz

# Restore file
mongorestore --gzip --archive=crewing.gz

# Copy between two servers
ssh server1 mongodump --db crewing --archive --gzip | ssh server2 mongorestore --archive --gzip
```
