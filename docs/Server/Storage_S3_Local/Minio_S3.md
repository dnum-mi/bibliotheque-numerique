## Minio S3

### Docker Minio
https://hub.docker.com/r/minio/minio

### Docker-Compose
https://github.com/minio/minio/blob/master/docs/orchestration/docker-compose/docker-compose.yaml

### AWS CLI
Installing or updating the latest version of the AWS CLI:
https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

Utiliser aws-cli pour test le S3.
```bash
aws configure

aws --endpoint-url http://localhost:9000 s3 ls

aws --endpoint-url http://localhost:9000 s3 mb s3://biblionumbucket

aws --endpoint-url http://localhost:9000 s3 ls

aws --endpoint-url http://localhost:9000 s3 cp test.txt s3://biblionumbucket

aws --endpoint-url http://localhost:9000 s3 ls s3://biblionumbucket
```

