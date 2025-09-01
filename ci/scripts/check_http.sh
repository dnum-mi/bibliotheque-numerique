#!/bin/bash
set -e

ret=0

echo "# Test Client up"
set +e
port=${1:-80}
path=${2:-}
timeout=120;
test_result=1
dirname=$(dirname $0)
until [ "$timeout" -le 0 -o "$test_result" -eq "0" ] ; do
        curl --fail --retry-max-time 120 --retry-delay 1  --retry 1  "http://localhost:${port}/${path}"
	test_result=$?
	echo "Wait $timeout seconds: http://localhost:${port}/${path} up $test_result";
	timeout=$(expr $timeout - 1)
	sleep 1
done
if [ "$test_result" -gt "0" ] ; then
	ret=$test_result
	echo "ERROR: http://localhost:${port}/${path}"
	exit $ret
fi

exit $ret
