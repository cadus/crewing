# crewing

Helps to gather people and plan missions


## Run

Install [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/). Then clone this repo and run:

```sh
npm install

# edit environment variables
cp env.sample .env
vim .env

# depending on your setting, start mongo and put the database in the current dir
npm run mongo

# start keystone (in production you might want to use something like pm2)
npm start

# change the default users password
```
