#!/bin/sh

# function bnum-dump {
    if [ "$#" -ne 1 ]; then
        echo "Usage: bnum-dump <path>"
        return 1
    fi

    #local current_date=$(date "+%Y-%m-%d")
    current_date=$(date "+%Y-%m-%d")
    #local filepath="$1/biblio-num_$current_date.dump"
    filepath="$1/biblio-num_$current_date.dump"

    export PGPASSWORD='password'
    pg_dump -U user -h localhost -d biblio-num -Fc > "$filepath"
    unset PGPASSWORD

    echo "Dump saved to: $filepath"
# }
