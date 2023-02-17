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
import stream, { PassThrough } from "stream";
import { HttpService } from "@nestjs/axios";
import { AxiosResponse } from "axios";
import { randomStringGenerator } from "@nestjs/common/utils/random-string-generator.util";
import { S3 } from "aws-sdk/clients/browser_default";

@Injectable()
export class FilesService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private s3 = new AWS.S3({
    accessKeyId: this.configService.get("file.accessKeyId"),
    secretAccessKey: this.configService.get("file.secretAccessKey"),
    endpoint: this.configService.get("file.awsDefaultS3Url"),
    region: this.configService.get("file.awsS3Region"),
    s3ForcePathStyle: true,
    signatureVersion: "v4",
  });

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

    return this.createFileStorage(
      name[this.configService.get("file.driver")],
      path[this.configService.get("file.driver")],
    );
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
        return this.s3
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

  async copyRemoteFile(fileUrl, fileName = null): Promise<FileStorage> {
    fileName = fileName.isNull ? fileUrl.split("/").pop() : fileName;

    const fileExtension = fileName.split(".").pop().toLowerCase();
    await this.fileFilter(fileExtension);

    const stream = await this.downloadFile(fileUrl);

    const uploadFromStream = (
      fileResponse: AxiosResponse,
      fileName: string,
    ): {
      passThrough: PassThrough;
      promise: Promise<S3.ManagedUpload.SendData>;
    } => {
      const passThrough = new PassThrough();
      const promise = this.s3
        .upload({
          Bucket: this.configService.get("file.awsDefaultS3Bucket"),
          Key: fileName,
          ContentType: fileResponse.headers["content-type"],
          Body: passThrough,
        })
        .promise();
      return { passThrough, promise };
    };

    const { passThrough, promise } = uploadFromStream(
      stream,
      await this.fileNameGenerator(fileName),
    );

    stream.data.pipe(passThrough);

    try {
      const { Key, Location } = await promise;
      return this.createFileStorage(Key, Location);
    } catch (e) {
      throw e;
    }
  }

  private async createFileStorage(name, path): Promise<FileStorage> {
    const new_file = new FileStorage();
    new_file.name = name;
    new_file.path = path;
    await new_file.save();
    return new_file;
  }

  private async downloadFile(fileUrl) {
    return await this.httpService.axiosRef({
      url: fileUrl,
      method: "GET",
      responseType: "stream",
    });
  }

  private async fileFilter(fileExtension) {
    const authorizedExtensions = this.configService.get(
      "file.authorizedExtensions",
    );
    if (
      authorizedExtensions.indexOf("*") === -1 &&
      authorizedExtensions.indexOf(fileExtension) === -1
    ) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            file: `cantUploadFileType`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  private async fileNameGenerator(originalName): Promise<string> {
    return `${randomStringGenerator()}.${originalName
      .split(".")
      .pop()
      .toLowerCase()}`;
  }
}
