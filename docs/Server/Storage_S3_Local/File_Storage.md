## File Storage (S3/Local)

### Type Storage
Support type Storage: "local", "s3", you can set the `FILE_DRIVER` in the .env 
```bash
FILE_DRIVER=s3
```
OR
```bash
FILE_DRIVER=local
```

### S3 config:
```bash
ACCESS_KEY_ID=Xul7GpTKGTEb8XnT
SECRET_ACCESS_KEY=hddVg3zIwVBAKdbilqOgZQs3i4TTjMDb
AWS_S3_REGION=fr-paris-1
AWS_DEFAULT_S3_BUCKET=biblionumbucket
AWS_DEFAULT_S3_URL=http://127.0.0.1:9000
```

### Local config:
```bash
FILE_STORAGE_LOCAL_DIR="./data/files"
```

### Common config:
```bash
# Set upload file max size, default setting is 5M
MAX_FILE_STORAGE_SIZE=5242880

# Set allow upload file extensions list
FILE_AUTHORIZED_EXTENSIONS="jpeg|jpg|png|gif|pdf|zip|xlsx"
# For Allow all extensions, you can use "*", is default setting
FILE_AUTHORIZED_EXTENSIONS="*"
```

### Exemple config:
```bash
FILE_DRIVER=s3
ACCESS_KEY_ID=Xul7GpTKGTEb8XnT
SECRET_ACCESS_KEY=hddVg3zIwVBAKdbilqOgZQs3i4TTjMDb
AWS_S3_REGION=fr-paris-1
AWS_DEFAULT_S3_BUCKET=biblionumbucket
AWS_DEFAULT_S3_URL=http://127.0.0.1:9000
MAX_FILE_STORAGE_SIZE=5242880
FILE_AUTHORIZED_EXTENSIONS="jpeg|jpg|png|gif|pdf|zip|xlsx"
```