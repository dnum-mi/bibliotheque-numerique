#!/bin/sh

# This script is used to launch the e2e tests.
echo "==========================================\n==== Migrating rnf-testing databse.. =====\n=========================================="
dotenv -e ./test/.env.test prisma migrate reset -- -f
echo "==========================================\n========= Launching e2e tests.. ==========\n=========================================="
if [ "x$1" = "xdev" ]
then
    dotenv -e ./test/.env.test jest -- --config ./test/e2e/jest-e2e.json --watch --runInBand --silent=false
else
    dotenv -e ./test/.env.test jest -- --config ./test/e2e/jest-e2e.json --silent=true --detectOpenHandles
fi
