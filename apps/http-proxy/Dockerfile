FROM bitnami/nginx:latest

COPY apps/http-proxy/nginx/rnf.conf /opt/bitnami/nginx/conf/server_blocks/rnf.conf
COPY apps/http-proxy/nginx/basic-auth.conf /opt/bitnami/nginx/conf/server_blocks/basic-auth.conf
COPY apps/http-proxy/nginx/users /opt/bitnami/nginx/users
COPY apps/http-proxy/entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
USER 1001
