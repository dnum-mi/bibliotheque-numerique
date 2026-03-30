import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import stream from 'stream'
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

import { Upload } from '@aws-sdk/lib-storage'

import { LoggerService } from '@/shared/modules/logger/logger.service'

export interface S3CopyResult {
  checksum: string
  byteSize: number
  s3Key: string
}

@Injectable()
export class S3Service implements OnModuleInit {
  private _s3: S3Client
  private _bucketName: string
  private maarchBucketName: string

  get s3(): S3Client {
    return this._s3
  }

  get bucketName(): string {
    return this._bucketName
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  static manageS3StreamError(err: Error): HttpException {
    if (err.name?.startsWith('NoSuchKey')) {
      return new NotFoundException('File not found')
    } else {
      return new InternalServerErrorException(err)
    }
  }

  async onModuleInit(): Promise<void> {
    this.logger.verbose('onModuleInit')
    await this._init()
  }

  private async _init(): Promise<void> {
    this._s3 = new S3Client({
      credentials: {
        accessKeyId: this.configService.get('file.accessKeyId'),
        secretAccessKey: this.configService.get('file.secretAccessKey'),
      },
      endpoint: this.configService.get('file.awsDefaultS3Url'),
      region: this.configService.get('file.awsS3Region'),
      forcePathStyle: true,
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    })
    this._bucketName = this.configService.get('file.awsDefaultS3Bucket')!
    this.maarchBucketName = this.configService.get('file.awsMaarchS3Bucket')!
    // TODO: for what ?
    //  this.maxFileSize = parseInt(
    //    (await this.bnConfigService.findByKeyName(
    //      eBnConfiguration.FILE_MAXIMUM_SIZE,
    //    )).stringValue,
    //  )
  }

  public async checkBucketAccess(): Promise<void> {
    await this._s3.send(
      new HeadBucketCommand({
        Bucket: this._bucketName,
      }),
    )
  }

  public async getStreamedFile(uuid: string): Promise<stream.Readable> {
    this.logger.verbose(`Getting file stream for uuid: ${uuid}`)

    const resultS3 = await this._s3.send(
      new GetObjectCommand({
        Bucket: this._bucketName,
        Key: uuid,
      }),
    )

    return resultS3.Body as stream.Readable
  }

  public async getCompleteFile(uuid: string): Promise<Buffer> {
    const stream = await this.getStreamedFile(uuid)
    return new Promise((resolve, reject) => {
      const chunks: never[] = []
      stream.on('data', (chunk) => chunks.push(chunk as never))
      stream.on('end', () => resolve(Buffer.concat(chunks)))
      stream.on('error', (e) => {
        reject(S3Service.manageS3StreamError(e))
      })
    })
  }

  public async downloadAndUploadToS3(url: string, uuid: string): Promise<void> {
    this.logger.verbose('downloadAndUploadToS3')
    const stream = await this.httpService.axiosRef({
      url,
      method: 'GET',
      responseType: 'stream',
    })
    const uploadS3 = new Upload({
      client: this._s3,
      params: {
        Bucket: this._bucketName,
        Key: uuid,
        Body: stream.data,
      },
      queueSize: 2,
      partSize: 8 * 1024 * 1024,
    })
    await uploadS3.done()
  }

  public async deleteFile(uuid: string): Promise<void> {
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: this._bucketName,
      Key: uuid,
    })
    await this._s3.send(deleteObjectCommand)
  }

  public async copyFromSourceBucket(
    sourceS3Path: string,
    newKey: string,
  ): Promise<S3CopyResult> {
    this.logger.debug(
      `Copying 's3://${this.maarchBucketName}/${sourceS3Path}' to 's3://${this._bucketName}/${newKey}'`,
    )

    const copyResult = await this._s3.send(
      new CopyObjectCommand({
        Bucket: this._bucketName,
        CopySource: `${this.maarchBucketName}/${sourceS3Path}`,
        Key: newKey,
      }),
    )

    // TODO: Pourquoi?
    const headResult = await this._s3.send(
      new HeadObjectCommand({
        Bucket: this._bucketName,
        Key: newKey,
      }),
    )
    if (!headResult.ContentLength || !headResult.ETag) {
      throw new InternalServerErrorException(
        `Failed to retrieve metadata for copied file: ${newKey}`,
      )
    }

    return {
      checksum: (headResult.ETag || copyResult.CopyObjectResult?.ETag || '').replace(/"/g, ''),
      byteSize: headResult.ContentLength || 0,
      s3Key: newKey,
    }
  }
}
