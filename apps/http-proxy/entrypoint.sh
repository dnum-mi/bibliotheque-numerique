#!/bin/bash

if [ "$TYPE_NGINX" = "rnf-internet" ]; then
  echo "La variable TYPE_NGINX est égale à rnf-internet, lancer le serveur rnf-internet"
  rm -f /opt/bitnami/nginx/conf/server_blocks/basic-auth.conf
  rm -f /opt/bitnami/nginx/users
  sed -i 's#${RNF_INTERNET_ALLOW_IP}#'$RNF_INTERNET_ALLOW_IP'#g' /opt/bitnami/nginx/conf/server_blocks/rnf.conf
  sed -i 's#${RNF_INTERNET_TOKEN}#'$RNF_INTERNET_TOKEN'#g' /opt/bitnami/nginx/conf/server_blocks/rnf.conf
  sed -i 's#${RNF_INTERNET_PROXY_PASS}#'$RNF_INTERNET_PROXY_PASS'#g' /opt/bitnami/nginx/conf/server_blocks/rnf.conf
elif [ "$TYPE_NGINX" = "basic-auth" ]; then
  echo "La variable TYPE_NGINX est égale à basic-auth, lancer le serveur basic-auth"
  rm -f /opt/bitnami/nginx/conf/server_blocks/rnf.conf
  sed -i 's#${BULLBOARD_PROXY_PASS}#'$BULLBOARD_PROXY_PASS'#g' /opt/bitnami/nginx/conf/server_blocks/basic-auth.conf
  sed -i 's#${MAILHOG_PROXY_PASS}#'$MAILHOG_PROXY_PASS'#g' /opt/bitnami/nginx/conf/server_blocks/basic-auth.conf
  sed -i 's#${ADMINER_PROXY_PASS}#'$ADMINER_PROXY_PASS'#g' /opt/bitnami/nginx/conf/server_blocks/basic-auth.conf
  sed -i 's#${BASIC_AUTH_USER_PASSWORD}#'$BASIC_AUTH_USER_PASSWORD'#g' /opt/bitnami/nginx/users
fi

/opt/bitnami/scripts/nginx/run.sh
