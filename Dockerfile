FROM bitnami/nginx:latest

USER root
RUN apt update && apt install curl -y
USER 1001
COPY nginx/*.conf /opt/bitnami/nginx/conf/bitnami/

USER 1001