FROM public.ecr.aws/bitnami/nginx:latest

# This Dockerfile is used to create a custom nginx image that serves as a reverse proxy for the client and server applications.
# It also includes basic authentication for the /admin route, which is used to access the Adminer interface of the application.
COPY apps/http-proxy/nginx/index.html /app/index.html
COPY apps/http-proxy/nginx/bn.conf /opt/bitnami/nginx/conf/server_blocks/bn.conf
COPY apps/http-proxy/nginx/basic-auth.conf /opt/bitnami/nginx/conf/server_blocks/basic-auth.conf
COPY apps/http-proxy/nginx/users /opt/bitnami/nginx/users
COPY apps/http-proxy/entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
USER 1001
