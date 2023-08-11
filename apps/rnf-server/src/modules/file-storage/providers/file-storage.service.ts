import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as AWS from 'aws-sdk'
import stream, { PassThrough } from 'stream'
import { HttpService } from '@nestjs/axios'
import { AxiosResponse } from 'axios'
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util'
import { S3 } from 'aws-sdk/clients/browser_default'
import { FileStorageEntity } from '../objects/entities/file-storage.entity'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { PrismaService } from '@/shared/modules/prisma/providers/prisma.service'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'

@Injectable()
export class FileStorageService extends BaseEntityService {
  constructor (
    protected readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly httpService: HttpService,
  ) {
    super(prisma)
    this.logger.setContext(this.constructor.name)
  }

  private s3 = new AWS.S3({
    accessKeyId: this.config.get('file.accessKeyId'),
    secretAccessKey: this.config.get('file.secretAccessKey'),
    endpoint: this.config.get('file.awsDefaultS3Url'),
    region: this.config.get('file.awsS3Region'),
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
  })

  async uploadFile (file, checksum = ''): Promise<FileStorageEntity> {
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

    return await this.prisma.fileStorage.create({
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        name: file.key,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        path: file.location,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        originalName: file.originalName,
        checksum,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        byteSize: file.size,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        mimeType: file.contentType,
      },
    })
  }

  public async findFileStorage (uuid: string): Promise<FileStorageEntity> {
    this.logger.verbose('findFileStorage')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return this.prisma.fileStorage.findUnique({ where: { uuid } }).then((fileStorage) => {
      if (!fileStorage) {
        throw new NotFoundException('')
      }
      return fileStorage
    })
  }

  public async getFile (uuid: string): Promise<{ stream: stream.Readable; info: FileStorageEntity }> {
    this.logger.verbose('getFile')
    const fileStorage = await this.findFileStorage(uuid)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const stream = this.s3.getObject({
      Bucket: this.config.get('file.awsDefaultS3Bucket'),
      Key: fileStorage.name,
    }).createReadStream()

    if (fileStorage) {
      return { stream, info: fileStorage }
    }
    throw new NotFoundException()
  }

  async copyRemoteFile (fileUrl, checksum, byteSize, mimeType, fileName = ''): Promise<FileStorageEntity> {
    this.logger.verbose('copyRemoteFile')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    fileName = fileName === '' ? fileUrl.split('/').pop() : fileName

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const fileExtension = fileName.split('.').pop().toLowerCase()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.fileFilter(fileExtension)

    const stream = await this.downloadFile(fileUrl)

    const { passThrough, promise } = this.uploadFromStream(stream, this.fileNameGenerator(fileName))

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    stream.data.pipe(passThrough)

    const { Key, Location } = await promise

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line max-len
    return this.prisma.fileStorage.create({ name: Key, path: Location, originalName: fileName, checksum, byteSize, mimeType })
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

    const promise = this.s3
      .upload({
        Bucket: 'rnfbucket', // TODO this.config.get('file.awsDefaultS3Bucket'),
        Key: fileName,
        ContentType: fileResponse.headers['content-type'],
        Body: passThrough,
      })
      .promise()
    return { passThrough, promise }
  }

  private async downloadFile (fileUrl): Promise<AxiosResponse> {
    this.logger.verbose('downloadFile')
    return await this.httpService.axiosRef({
      url: fileUrl,
      method: 'GET',
      responseType: 'stream',
    })
  }

  private fileFilter (fileExtension: string): void {
    this.logger.verbose('fileFilter')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const authorizedExtensions: string = this.config.get('file.authorizedExtensions')
    if (!authorizedExtensions.includes('*') && !authorizedExtensions.includes(fileExtension)) {
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

  private fileNameGenerator (originalName: string): string {
    this.logger.verbose('fileNameGenerator')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return `${randomStringGenerator()}.${originalName.split('.').pop().toLowerCase()}`
  }
}
