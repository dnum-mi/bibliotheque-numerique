#!/bin/sh

export NODE_ENV='test-unit'

# This script is used to launch the e2e tests.
clear
echo "============================================\n======== Launching unit tests.. ============\n============================================"
if [ "x$1" = "xdev" ]; then
    dotenv -e ./test/.env.test jest -- --config ./test/unit/jest-unit.json --watch --silent=false
elif [ "x$1" = "xcoverage" ]; then
    dotenv -e ./test/.env.test jest -- --config ./test/unit/jest-unit.json --silent=true --coverage=true
else
    dotenv -e ./test/.env.test jest -- --config ./test/unit/jest-unit.json --silent=true --detectOpenHandles
fi
