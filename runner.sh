#/bin/bash

yarn build

while true
do
  yarn start >> $1 2>&1
done
