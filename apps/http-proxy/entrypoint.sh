#!/bin/bash
sed -i 's#${RNF_INTERNET_ALLOW_IP}#'$RNF_INTERNET_ALLOW_IP'#g' /opt/bitnami/nginx/conf/server_blocks/rnf.conf
sed -i 's#${RNF_INTERNET_TOKEN}#'$RNF_INTERNET_TOKEN'#g' /opt/bitnami/nginx/conf/server_blocks/rnf.conf
sed -i 's#${RNF_INTERNET_PROXY_PASS}#'$RNF_INTERNET_PROXY_PASS'#g' /opt/bitnami/nginx/conf/server_blocks/rnf.conf

/opt/bitnami/scripts/nginx/run.sh
