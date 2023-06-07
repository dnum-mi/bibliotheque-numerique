#!/bin/sh

# This script is used to launch the unit tests.
clear
echo "==========================================\n========= Launching unit tests.. =========\n=========================================="
jest --config ./src/test/jest-unit.json
