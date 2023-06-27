#!/bin/sh

# This script is used to launch the e2e tests.
echo "==========================================\n==== Migrating rnf-testing databse.. =====\n=========================================="
clear
dotenv -e ./src/test/.env.test prisma migrate reset -- -f
clear
echo "==========================================\n========= Launching e2e tests.. ==========\n=========================================="
if [ $1 = 'dev' ]
then
    dotenv -e ./src/test/.env.test jest -- --config ./src/test/jest-e2e.json --watch --silent=false
else
    dotenv -e ./src/test/.env.test jest -- --config ./src/test/jest-e2e.json
fi
