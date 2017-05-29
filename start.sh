#!/bin/bash

# /var/tmp because mongo had permission hiccups
MONGOPID=/var/tmp/mongod.pid

# trap ctrl-c and call cleanup()
trap cleanup INT

function cleanup() {
   kill $(cat $MONGOPID)
   rm $MONGOPID mongo.log
}

# run mongo
mkdir -p database
mongod --fork --dbpath database --logpath mongo.log --logappend --pidfilepath $MONGOPID

# run node with watcher and restart on relevant file change
nodemon --inspect index.js --ignore client
