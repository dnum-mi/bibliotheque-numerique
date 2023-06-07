#!/bin/sh

# This script is used to launch the e2e tests.
echo "==========================================\n==== Migrating rnf-testing databse.. =====\n=========================================="
clear
dotenv -e ./src/test/.env.test prisma migrate reset -- -f
clear
echo "==========================================\n========= Launching e2e tests.. ==========\n=========================================="
dotenv -e ./src/test/.env.test jest -- --config ./src/test/jest-e2e.json
