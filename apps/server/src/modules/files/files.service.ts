import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as AWS from 'aws-sdk'
import { createReadStream } from 'fs'
import { join } from 'path'
import stream, { PassThrough } from 'stream'
import { HttpService } from '@nestjs/axios'
import { AxiosResponse } from 'axios'
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util'
import { S3 } from 'aws-sdk/clients/browser_default'
import { FileStorage } from './file_storage.entity'
import { LoggerService } from '../../shared/modules/logger/logger.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class FilesService {
  constructor (
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private logger: LoggerService,
    @InjectRepository(FileStorage) private repo: Repository<FileStorage>,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private s3 = new AWS.S3({
    accessKeyId: this.configService.get('file.accessKeyId'),
    secretAccessKey: this.configService.get('file.secretAccessKey'),
    endpoint: this.configService.get('file.awsDefaultS3Url'),
    region: this.configService.get('file.awsS3Region'),
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
  })

  async uploadFile (file, checksum = ''): Promise<FileStorage> {
    this.logger.verbose('uploadFile')
    if (!file) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            file: 'selectFile',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      )
    }

    const name = {
      local: file.filename,
      s3: file.key,
    }

    const path = {
      local: `${this.configService.get('file.localStorageDir')}/${file.filename}`,
      s3: file.location,
    }

    const mimeType = {
      local: file.mimetype,
      s3: file.contentType,
    }
    return this.repo.save<Partial<FileStorage>>({
      name: name[this.configService.get('file.driver')],
      path: path[this.configService.get('file.driver')],
      originalName: file.originalname,
      checksum,
      byteSize: file.size,
      mimeType: mimeType[this.configService.get('file.driver')],
    })
  }

  public async findFileStorage (fileStorageId: string): Promise<FileStorage> {
    this.logger.verbose('findFileStorage')
    return await this.repo.findOneBy({ id: fileStorageId })
  }

  public async getFile (fileStorageId: string): Promise<{ stream: stream.Readable; info: FileStorage }> {
    this.logger.verbose('getFile')
    const fileStorage = await this.findFileStorage(fileStorageId)

    const stream = {
      // TODO: fixe type
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      local: () => {
        return createReadStream(join(this.configService.get('file.localStorageDir'), fileStorage.name))
      },
      // TODO: fixe type
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      s3: () => {
        return this.s3
          .getObject({
            Bucket: this.configService.get('file.awsDefaultS3Bucket'),
            Key: fileStorage.name,
          })
          .createReadStream()
      },
    }

    if (fileStorage) {
      return {
        stream: stream[this.configService.get('file.driver')](),
        info: fileStorage,
      }
    }
    throw new NotFoundException()
  }

  async copyRemoteFile (fileUrl, checksum, byteSize, mimeType, fileName = null): Promise<FileStorage> {
    this.logger.verbose('copyRemoteFile')
    fileName = fileName.isNull ? fileUrl.split('/').pop() : fileName

    const fileExtension = fileName.split('.').pop().toLowerCase()
    this.fileFilter(fileExtension)

    const stream = await this.downloadFile(fileUrl)

    const { passThrough, promise } = this.uploadFromStream(stream, await this.fileNameGenerator(fileName))

    stream.data.pipe(passThrough)

    const { Key, Location } = await promise
    return this.repo.save<Partial<FileStorage>>({
      name: Key,
      path: Location,
      originalName: fileName,
      checksum,
      byteSize,
      mimeType,
    })
  }

  private uploadFromStream (
    fileResponse: AxiosResponse,
    fileName: string,
  ): {
    passThrough: PassThrough;
    promise: Promise<S3.ManagedUpload.SendData>;
  } {
    this.logger.verbose('uploadFromStream')
    const passThrough = new PassThrough()
    this.logger.debug({
      Bucket: this.configService.get('file.awsDefaultS3Bucket'),
      Key: fileName,
      ContentType: fileResponse.headers['content-type'],
    })
    const promise = this.s3
      .upload({
        Bucket: this.configService.get('file.awsDefaultS3Bucket'),
        Key: fileName,
        ContentType: fileResponse.headers['content-type'],
        Body: passThrough,
      })
      .promise()
    return { passThrough, promise }
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private async downloadFile (fileUrl) {
    this.logger.verbose('downloadFile')
    return await this.httpService.axiosRef({
      url: fileUrl,
      method: 'GET',
      responseType: 'stream',
    })
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private fileFilter (fileExtension) {
    this.logger.verbose('fileFilter')
    const authorizedExtensions = this.configService.get('file.authorizedExtensions')
    if (authorizedExtensions.indexOf('*') === -1 && authorizedExtensions.indexOf(fileExtension) === -1) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            file: 'cantUploadFileType',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      )
    }
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private fileNameGenerator (originalName) {
    this.logger.verbose('fileNameGenerator')
    return `${randomStringGenerator()}.${originalName.split('.').pop().toLowerCase()}`
  }
}
