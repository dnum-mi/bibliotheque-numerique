import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FileStorage } from "../entities";
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

  async uploadFile(file, checksum = ""): Promise<FileStorage> {
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

    const mimeType = {
      local: file.mimetype,
      s3: file.contentType,
    };

    return this.createFileStorage(
      name[this.configService.get("file.driver")],
      path[this.configService.get("file.driver")],
      file.originalname,
      checksum,
      file.size,
      mimeType[this.configService.get("file.driver")],
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

  async copyRemoteFile(
    fileUrl,
    checksum,
    byteSize,
    mimeType,
    fileName = null,
  ): Promise<FileStorage> {
    fileName = fileName.isNull ? fileUrl.split("/").pop() : fileName;

    const fileExtension = fileName.split(".").pop().toLowerCase();
    this.fileFilter(fileExtension);

    const stream = await this.downloadFile(fileUrl);

    const { passThrough, promise } = this.uploadFromStream(
      stream,
      await this.fileNameGenerator(fileName),
    );

    stream.data.pipe(passThrough);

    const { Key, Location } = await promise;
    return this.createFileStorage(
      Key,
      Location,
      fileName,
      checksum,
      byteSize,
      mimeType,
    );
  }

  private uploadFromStream(
    fileResponse: AxiosResponse,
    fileName: string,
  ): {
    passThrough: PassThrough;
    promise: Promise<S3.ManagedUpload.SendData>;
  } {
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
  }

  private async createFileStorage(
    name,
    path,
    originalName,
    checksum,
    byteSize,
    mimeType,
  ): Promise<FileStorage> {
    const newFile = new FileStorage();
    newFile.name = name;
    newFile.path = path;
    newFile.originalName = originalName;
    newFile.checksum = checksum;
    newFile.byteSize = byteSize;
    newFile.mimeType = mimeType;
    await newFile.save();
    return newFile;
  }

  private async downloadFile(fileUrl) {
    return await this.httpService.axiosRef({
      url: fileUrl,
      method: "GET",
      responseType: "stream",
    });
  }

  private fileFilter(fileExtension) {
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

  private fileNameGenerator(originalName) {
    return `${randomStringGenerator()}.${originalName
      .split(".")
      .pop()
      .toLowerCase()}`;
  }
}
