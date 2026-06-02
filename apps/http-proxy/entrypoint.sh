#!/bin/bash

if [ "$TYPE_NGINX" = "bn" ]; then
  echo "La variable TYPE_NGINX est égale à bn, lancer le serveur bn"
  rm -f /opt/bitnami/nginx/conf/server_blocks/basic-auth.conf
  rm -f /opt/bitnami/nginx/users
elif [ "$TYPE_NGINX" = "basic-auth" ]; then
  echo "La variable TYPE_NGINX est égale à basic-auth, lancer le serveur basic-auth"
  rm -f /opt/bitnami/nginx/conf/server_blocks/bn.conf
  sed -i 's#${ADMINER_PROXY_PASS}#'$ADMINER_PROXY_PASS'#g' /opt/bitnami/nginx/conf/server_blocks/basic-auth.conf
fi

exec nginx -g "daemon off;"
