const config = {
  file: {
    driver: process.env.FILE_DRIVER,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    awsDefaultS3Bucket: process.env.AWS_DEFAULT_S3_BUCKET,
    awsDefaultS3Url: process.env.AWS_DEFAULT_S3_URL,
    awsS3Region: process.env.AWS_S3_REGION,
    localStorageDir: process.env.FILE_STORAGE_LOCAL_DIR || "./data/files",
    maxFileSize: process.env.MAX_FILE_STORAGE_SIZE || 5242880, // 5mb
    authorizedExtensions: process.env.FILE_AUTHORIZED_EXTENSIONS.split("|") || [
      "*",
    ],
  },
};

export default () => config;
