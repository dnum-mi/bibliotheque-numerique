import { registerAs } from '@nestjs/config'

export default registerAs('file', () => ({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  awsDefaultS3Bucket: process.env.AWS_DEFAULT_S3_BUCKET,
  awsDefaultS3Url: process.env.AWS_DEFAULT_S3_URL,
  awsS3Region: process.env.AWS_S3_REGION,
  authorizedExtensions: process.env.FILE_AUTHORIZED_EXTENSIONS?.split('|') || ['*'],
}))
