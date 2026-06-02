FROM docker.io/nginx:1.27.2

# This Dockerfile is used to create a custom nginx image that serves as a reverse proxy for the client and server applications.
# It also includes basic authentication for the /admin route, which is used to access the Adminer interface of the application.
COPY apps/http-proxy/nginx/bn.conf /etc/nginx/conf.d/bn.conf
COPY apps/http-proxy/entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
