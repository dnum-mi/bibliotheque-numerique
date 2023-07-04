#!/bin/sh

# This script is used to launch the unit tests.
clear
echo "==========================================\n========= Launching unit tests.. =========\n=========================================="
if [ "x$1" = "xdev" ]
then
    jest --config ./test/unit/jest-unit.json --watch --silent=false
else
    jest --config ./test/unit/jest-unit.json --detectOpenHandles --silent=true
fi
