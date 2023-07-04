#!/bin/sh

export NODE_ENV='test-e2e'

# This script is used to launch the e2e tests.
clear
echo "============================================\n======== Loading fixture in database.. =====\n============================================"
dotenv -e ./test/.env.test pnpm run fixtures
echo "============================================\n======== Launching e2e tests.. =============\n============================================"
if [ "x$1" = "xdev" ]
then
    dotenv -e ./test/.env.test jest -- --config ./test/jest-e2e.json --watch --silent=false
else
    dotenv -e ./test/.env.test jest -- --config ./test/jest-e2e.json
fi
