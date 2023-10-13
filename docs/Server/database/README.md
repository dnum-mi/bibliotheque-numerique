# Database Dump & Restore Documentation

In the lifecycle of our project, it's crucial to keep an up-to-date basic version of our database. This ensures that every developer joining the project or setting it up locally gets the latest database schema and data, facilitating a smoother onboarding experience.

To achieve this, we utilize two utility functions: `bnum-dump` and `bnum-restore`.

### Stack

To resore, we need PostgreSQL v16

## Directory Structure

The root of our project contains a folder named `dumps`. This folder will hold the basic versions of our database, which includes essential data such as an admin user, base configurations, etc.
The file at the root of this folder should be the minimal smallest version to run the project and it should be versioned by git.

Developers should then add folder with their own dumps, involving their own data, to not loose them.
Thoses versions should be ignored by git to not flood the repository.

## Utility Functions

### 1. bnum-dump

This function creates a dump of the current `biblio-num` database with the current date.

**Usage:**

```bash
bnum-dump /path/to/store/the/dump
```

For instance, to create a dump inside the `dumps` folder:

```bash
bnum-dump <root-of-the-project>/dumps
```

The function will automatically name the dump file with the current date for easier tracking.

**Function Code:**
You can store this in your env of your computer to access it.

```bash
function bnum-dump {
    if [ "$#" -ne 1 ]; then
        echo "Usage: bnum-dump <path>"
        return 1
    fi

    local current_date=$(date "+%Y-%m-%d")
    local filepath="$1/biblio-num_$current_date.dump"

    export PGPASSWORD='password'
    pg_dump -U user -h localhost -d biblio-num -Fc > "$filepath"
    unset PGPASSWORD

    echo "Dump saved to: $filepath"
}
```

### bnum-restore

This function restores the `biblio-num` database from a given dump file.

```bash
bnum-restore /path/to/restore/file
```

For instance, to restore from a dump inside the dumps folder:

```bash
bnum-restore ./dumps/biblio-num_YYYY-MM-DD.dump
```

Note: Ensure you replace YYYY-MM-DD with the actual date in the dump file's name.

**Function Code:**
You can store this in your env of your computer to access it.

```bash
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

    pg_restore -U user -h localhost -d postgres --no-owner -v "$1"

    unset PGPASSWORD
}
```

## How to Work

When working on this project, especially if your development involves a database migration or introduces a breaking change, it's crucial to ensure that the base dump in the `dumps` folder remains updated. Here's the recommended workflow to ensure you don't lose any personal data from your local database while updating the base dump:

1. **Backup Your Data**: Before starting any development that affects the database, always dump your current local database to ensure you have a backup of all your data.

    ```bash
    bnum-dump /dumps/personnal-directory-not-versioned
    ```

2. **Load the Base Database**: Restore the basic version of the database stored in the `dumps` folder. This ensures you're working off the latest shared version.

    ```bash
    bnum-restore ./dumps/biblio-num_YYYY-MM-DD.dump
    ```

   Note: Replace `YYYY-MM-DD` with the date in the dump file's name.

3. **Develop & Migrate**: Perform your development tasks. If your changes involve a migration or any significant database change, apply them to this base database.

4. **Update the Base Dump**: Once you're satisfied with your changes, dump this updated version of the database and overwrite the base dump inside the `dumps` folder.

    ```bash
    bnum-dump ./dumps
    ```

5. **Push to Git**: Commit the updated dump to Git, ensuring the entire team benefits from the latest database changes.

    ```bash
    git add ./dumps/biblio-num_YYYY-MM-DD.dump
    git commit -m "Updated base dump with latest changes"
    git push
    ```

6. **Restore Your Personal Database**: Once you've updated the base dump and pushed your changes, you can restore your local database to its previous state using your personal backup from Step 1.

    ```bash
    bnum-restore /dumps/personnal-directory-not-versioned/biblio-num_YYYY-MM-DD.dump
    ```

   Note: Replace `YYYY-MM-DD` with the date in your personal backup's name.

By following this workflow, you ensure the base dump remains up-to-date without sacrificing any personal data in your local database.
