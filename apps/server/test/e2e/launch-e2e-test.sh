#!/bin/sh

export NODE_ENV='test-e2e'

# This script is used to launch the e2e tests.
clear
echo "============================================\n======== Loading fixture in database.. =====\n============================================"
dotenv -e ./test/.env.test pnpm run fixtures
echo "============================================\n======== Launching e2e tests.. =============\n============================================"
if [ "x$1" = "xdev" ]; then
    dotenv -e ./test/.env.test jest -- --config ./test/e2e/jest-e2e.json --watch --silent=false
elif [ "x$1" = "xcoverage" ]; then
    dotenv -e ./test/.env.test jest -- --config ./test/e2e/jest-e2e.json --silent=true --coverage=true
else
    dotenv -e ./test/.env.test jest -- --config ./test/e2e/jest-e2e.json --detectOpenHandles --silent=true --forceExit
fi
