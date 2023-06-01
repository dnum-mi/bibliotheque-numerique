import { HttpException, HttpStatus, Module } from "@nestjs/common";
import { FilesController } from "./files.controller";
import { MulterModule } from "@nestjs/platform-express";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { diskStorage } from "multer";
import { randomStringGenerator } from "@nestjs/common/utils/random-string-generator.util";
import * as AWS from "aws-sdk";
import * as multerS3 from "multer-s3";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileStorage } from "./file_storage.entity";
import { FilesService } from "./files.service";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([FileStorage]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const storages = {
          // TODO: fixe type
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          local: () =>
            diskStorage({
              destination: configService.get("file.localStorageDir"),
              filename: (request, file, callback) => {
                callback(
                  null,
                  `${randomStringGenerator()}.${file.originalname
                    .split(".")
                    .pop()
                    .toLowerCase()}`,
                );
              },
            }),
          // TODO: fixe type
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          s3: () => {
            const s3 = new AWS.S3({
              accessKeyId: configService.get("file.accessKeyId"),
              secretAccessKey: configService.get("file.secretAccessKey"),
              endpoint: configService.get("file.awsDefaultS3Url"),
              region: configService.get("file.awsS3Region"),
              s3ForcePathStyle: true,
              signatureVersion: "v4",
            });

            return multerS3({
              s3: s3,
              bucket: configService.get("file.awsDefaultS3Bucket"),
              acl: "public-read",
              contentType: multerS3.AUTO_CONTENT_TYPE,
              key: (request, file, callback) => {
                callback(
                  null,
                  `${randomStringGenerator()}.${file.originalname
                    .split(".")
                    .pop()
                    .toLowerCase()}`,
                );
              },
            });
          },
        };

        return {
          // TODO: fixe type
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          fileFilter: (request, file, callback) => {
            const authorizedExtensions = configService.get(
              "file.authorizedExtensions",
            );
            const fileExtension = file.originalname
              .split(".")
              .pop()
              .toLowerCase();
            if (
              authorizedExtensions.indexOf("*") === -1 &&
              authorizedExtensions.indexOf(fileExtension) === -1
            ) {
              return callback(
                new HttpException(
                  {
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                      file: `cantUploadFileType`,
                    },
                  },
                  HttpStatus.UNPROCESSABLE_ENTITY,
                ),
                false,
              );
            }

            callback(null, true);
          },
          storage: storages[configService.get("file.driver")](),
          limits: {
            fileSize: configService.get("file.maxFileSize"),
          },
        };
      },
    }),
  ],
  controllers: [FilesController],
  providers: [ConfigModule, ConfigService, FilesService],
  exports: [FilesService],
})
export class FilesModule {}
