import { HttpException, HttpStatus, Module } from '@nestjs/common'
import { FileStorageController } from './controllers/file-storage.controller'
import { MulterModule } from '@nestjs/platform-express'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util'
import * as AWS from 'aws-sdk'
import * as multerS3 from 'multer-s3'
import { FileStorageService } from './providers/file-storage.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    HttpModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const storages = () => {
          const s3 = new AWS.S3({
            accessKeyId: configService.get('file.accessKeyId'),
            secretAccessKey: configService.get('file.secretAccessKey'),
            endpoint: configService.get('file.awsDefaultS3Url'),
            region: configService.get('file.awsS3Region'),
            s3ForcePathStyle: true,
            signatureVersion: 'v4',
          })

          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return multerS3({
            s3,
            bucket: configService.get('file.awsDefaultS3Bucket'),
            acl: 'public-read',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: (request, file, callback) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              callback(null, `${randomStringGenerator()}.${file.originalname.split('.').pop().toLowerCase()}`)
            },
          })
        }

        return {
          // TODO: fixe type
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          fileFilter: (request, file, callback) => {
            const authorizedExtensions = configService.get('file.authorizedExtensions')
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const fileExtension = file.originalname.split('.').pop().toLowerCase()
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (authorizedExtensions.indexOf('*') === -1 && authorizedExtensions.indexOf(fileExtension) === -1) {
              return callback(
                new HttpException(
                  {
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                      file: 'cantUploadFileType',
                    },
                  },
                  HttpStatus.UNPROCESSABLE_ENTITY,
                ),
                false,
              )
            }

            callback(null, true)
          },
          storage: storages(),
          limits: {
            fileSize: configService.get('file.maxFileSize'),
          },
        }
      },
    }),
  ],
  controllers: [FileStorageController],
  providers: [ConfigModule, ConfigService, FileStorageService],
  exports: [FileStorageService],
})
export class FileStorageModule {}
