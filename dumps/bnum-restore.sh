#!/bin/sh

function bnum-restore {
    if [ "$#" -ne 1 ]; then
        echo "Usage: bnum-restore <path>"
        return 1
    fi

    export PGPASSWORD='password'

    # Terminate all active connection to "biblio-num"
    psql -U user -h localhost -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'biblio-num';"

    # DROPPING
    psql -U user -h localhost -d postgres -c "DROP DATABASE IF EXISTS \"biblio-num\";"
    psql -U user -h localhost -d postgres -c "CREATE DATABASE \"biblio-num\";"

    pg_restore -U user -h localhost -d biblio-num --no-owner -v "$1"

    unset PGPASSWORD
}
