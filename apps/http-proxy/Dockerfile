FROM bitnami/nginx:latest

COPY apps/http-proxy/nginx/rnf.conf /opt/bitnami/nginx/conf/server_blocks/rnf.conf
COPY apps/http-proxy/entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
USER 1001
