#!/bin/bash

PACKAGE=(nodemon express multer mongoose body-parser cors bcrypt jsonwebtoken passport passport-jwt)

for item in ${PACKAGE[*]}
do
  echo "installing $item..."
  npm install --save $item
done
