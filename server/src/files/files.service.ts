import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FileStorage } from "../entities/file_storage.entity";
import * as AWS from "aws-sdk";
import { createReadStream } from "fs";
import { join } from "path";
import stream from "stream";

@Injectable()
export class FilesService {
  constructor(private readonly configService: ConfigService) {}

  async uploadFile(file): Promise<FileStorage> {
    if (!file) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            file: "selectFile",
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const name = {
      local: file.filename,
      s3: file.key,
    };

    const path = {
      local: `${this.configService.get("file.localStorageDir")}/${
        file.filename
      }`,
      s3: file.location,
    };

    const new_file = new FileStorage();
    new_file.name = name[this.configService.get("file.driver")];
    new_file.path = path[this.configService.get("file.driver")];
    await new_file.save();

    return new_file;
  }

  public async findFileStorage(fileStorageId: string): Promise<FileStorage> {
    return await FileStorage.findOneBy({ id: fileStorageId });
  }

  public async getFile(
    fileStorageId: string,
  ): Promise<{ stream: stream.Readable; info: FileStorage }> {
    const fileStorage = await this.findFileStorage(fileStorageId);

    const stream = {
      local: () => {
        return createReadStream(
          join(
            this.configService.get("file.localStorageDir"),
            fileStorage.name,
          ),
        );
      },
      s3: () => {
        const s3 = new AWS.S3({
          accessKeyId: this.configService.get("file.accessKeyId"),
          secretAccessKey: this.configService.get("file.secretAccessKey"),
          endpoint: this.configService.get("file.awsDefaultS3Url"),
          region: this.configService.get("file.awsS3Region"),
          s3ForcePathStyle: true,
          signatureVersion: "v4",
        });

        return s3
          .getObject({
            Bucket: this.configService.get("file.awsDefaultS3Bucket"),
            Key: fileStorage.name,
          })
          .createReadStream();
      },
    };

    if (fileStorage) {
      return {
        stream: stream[this.configService.get("file.driver")](),
        info: fileStorage,
      };
    }
    throw new NotFoundException();
  }
}
