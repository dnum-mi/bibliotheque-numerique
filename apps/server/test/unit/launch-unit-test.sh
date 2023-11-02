#!/bin/sh

export NODE_ENV='test-unit'

# This script is used to launch the e2e tests.
clear
echo "============================================\n======== Launching unit tests.. ============\n============================================"
if [ "x$1" = "xdev" ]
then
    dotenv -e ./test/.env.test jest -- --config ./test/unit/jest-unit.json --watch --silent=false
else
    dotenv -e ./test/.env.test jest -- --config ./test/unit/jest-unit.json --silent=true --detectOpenHandles --coverage=true
fi
