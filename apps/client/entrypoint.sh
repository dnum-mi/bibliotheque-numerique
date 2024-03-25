#!/bin/bash

sed -i 's#__AG_GRID_LICENSE_KEY__#'$AG_GRID_LICENSE_KEY'#g' /app/assets/index*.js

/opt/bitnami/scripts/nginx/run.sh