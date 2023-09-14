import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
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
import { CreateFileStorageDto } from '@/shared/objects/file-storage/create-file.dto'

@Injectable()
export class FileStorageService extends BaseEntityService {
  private s3: S3
  private bucketName: string
  private authorizedExtensions: string

  constructor (
    protected readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly httpService: HttpService,
  ) {
    super(prisma)
    this.logger.setContext(this.constructor.name)
    this.s3 = new AWS.S3({
      accessKeyId: this.config.get('file.accessKeyId'),
      secretAccessKey: this.config.get('file.secretAccessKey'),
      endpoint: this.config.get('file.awsDefaultS3Url'),
      region: this.config.get('file.awsS3Region'),
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    })
    this.bucketName = this.config.get('file.awsDefaultS3Bucket')!
    this.authorizedExtensions = this.config.get('file.authorizedExtensions')!
  }

  public async findFileStorage (uuid: string): Promise<FileStorageEntity> {
    this.logger.verbose('findFileStorage')
    return this.prisma.fileStorage.findFirst({ where: { uuid } }).then((fileStorage) => {
      if (!fileStorage) {
        throw new NotFoundException('UUID not found')
      }
      return fileStorage
    })
  }

  public async getFile (uuid: string): Promise<{ stream: stream.Readable; info: FileStorageEntity }> {
    this.logger.verbose('getFile')

    const fileStorage: FileStorageEntity = await this.findFileStorage(uuid)

    if (fileStorage) {
      const stream: stream.Readable = this.s3GetObject(fileStorage.name)
      return { stream, info: fileStorage }
    }
    throw new NotFoundException("File doesn't exist in the bucket")
  }

  async copyRemoteFile ({ fileUrl, originalName }: CreateFileStorageDto):
    Promise<{ key: string, location: string }> {
    this.logger.verbose('copyRemoteFile')
    const fileExtension: string = this.fileExtension(originalName)
    this.fileFilter(fileExtension)

    const stream: AxiosResponse<{
      pipe: (pt: PassThrough) => void
    }> = await this.downloadFile(fileUrl)

    const { passThrough, promise } = this.uploadFromStream(stream, this.fileNameGenerator(fileExtension))

    stream.data.pipe(passThrough)

    const { Key, Location } = await promise

    return {
      key: Key,
      location: Location,
    }
  }

  s3GetObject (Key: string): stream.Readable {
    return this.s3.getObject({
      Bucket: this.bucketName,
      Key,
    }).createReadStream()
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
        Bucket: this.bucketName,
        Key: fileName,
        ContentType: fileResponse.headers['content-type'],
        Body: passThrough,
      })
      .promise()
    return { passThrough, promise }
  }

  private async downloadFile (fileUrl: string): Promise<AxiosResponse> {
    this.logger.verbose('downloadFile')
    return await this.httpService.axiosRef({
      url: fileUrl,
      method: 'GET',
      responseType: 'stream',
    }).catch((error) => {
      this.logger.error(error as Error)
      throw new NotFoundException('File is not found')
    })
  }

  private fileFilter (fileExtension: string): void {
    this.logger.verbose('fileFilter')
    if (!this.authorizedExtensions.includes('*') && !this.authorizedExtensions.includes(fileExtension)) {
      throw new UnprocessableEntityException('File is not valid')
    }
  }

  private fileNameGenerator (fileExtension: string): string {
    this.logger.verbose('fileNameGenerator')
    return `${randomStringGenerator()}.${fileExtension.toLowerCase()}`
  }

  private fileExtension (fileName: string): string {
    this.logger.verbose('fileExtension')
    return fileName.slice((fileName.lastIndexOf('.') - 1 >>> 0) + 2)
  }
}
